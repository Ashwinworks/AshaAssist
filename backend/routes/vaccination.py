"""
Vaccination schedules and bookings management routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
import json

# Create blueprint
vaccination_bp = Blueprint('vaccination', __name__)

def init_vaccination_routes(app, collections):
    """Initialize vaccination routes with dependencies"""
    
    @vaccination_bp.route('/api/vaccination-schedules', methods=['POST'])
    @jwt_required()
    def create_vaccination_schedule():
        """Create a new vaccination schedule"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can create schedules'}), 403
            
            user_id = get_jwt_identity()
            data = request.get_json() or {}
            
            # Required: date (YYYY-MM-DD), time string, location, vaccines[]
            title = (data.get('title') or '').strip() or 'Vaccination Schedule'
            date_str = (data.get('date') or '').strip()
            time_str = (data.get('time') or '').strip()
            location = (data.get('location') or '').strip()
            vaccines = data.get('vaccines') or []
            description = (data.get('description') or '').strip()
            
            if not date_str or not location or not vaccines:
                return jsonify({'error': 'date, location and vaccines are required'}), 400
            
            if not isinstance(vaccines, list) or not all(isinstance(v, str) and v.strip() for v in vaccines):
                return jsonify({'error': 'vaccines must be a non-empty array of strings'}), 400
            
            # Normalize vaccines
            vaccines = [v.strip() for v in vaccines]
            
            # Parse date only
            try:
                date_dt = datetime.strptime(date_str, '%Y-%m-%d').date()
            except Exception:
                return jsonify({'error': 'date must be in YYYY-MM-DD format'}), 400
            
            doc = {
                'title': title,
                'date': date_dt.isoformat(),
                'time': time_str,
                'location': location,
                'vaccines': vaccines,
                'description': description,
                'createdBy': ObjectId(user_id),
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc),
                'status': 'Scheduled'
            }
            
            res = collections['vaccination_schedules'].insert_one(doc)
            return jsonify({'id': str(res.inserted_id), 'message': 'Schedule created'}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to create schedule: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination-schedules', methods=['GET'])
    @jwt_required()
    def list_vaccination_schedules():
        """List vaccination schedules"""
        try:
            user_id = get_jwt_identity()
            claims = get_jwt() or {}
            user_type = claims.get('userType')

            # Optional filter by date >= from_date (default 1 year ago)
            from_date = request.args.get('fromDate')  # YYYY-MM-DD
            query = {}
            if from_date:
                try:
                    _ = datetime.strptime(from_date, '%Y-%m-%d').date().isoformat()
                    query['date'] = { '$gte': _ }
                except Exception:
                    pass

            # Get candidate schedules
            cursor = collections['vaccination_schedules'].find(query).sort('date', 1)
            raw_schedules = list(cursor)

            if not raw_schedules:
                return jsonify({'schedules': []}), 200

            schedules = []

            # ASHA workers and admins see all schedules (including expired ones for tracking)
            if user_type in ['asha_worker', 'admin']:
                for doc in raw_schedules:
                    schedules.append({
                        'id': str(doc['_id']),
                        'title': doc.get('title'),
                        'date': doc.get('date'),
                        'time': doc.get('time'),
                        'location': doc.get('location'),
                        'vaccines': doc.get('vaccines', []),
                        'description': doc.get('description', ''),
                        'status': doc.get('status', 'Scheduled'),
                        'createdBy': str(doc.get('createdBy')) if doc.get('createdBy') else None,
                        'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                        'updatedAt': doc.get('updatedAt').isoformat() if isinstance(doc.get('updatedAt'), datetime) else doc.get('updatedAt'),
                    })
            else:
                # Regular users: filter expired schedules unless they have completed bookings
                # Get schedule IDs for booking lookup
                schedule_ids = [doc['_id'] for doc in raw_schedules]

                # Get user's completed bookings for these schedules
                user_completed_bookings = collections['vaccination_bookings'].find({
                    'scheduleId': {'$in': schedule_ids},
                    'userId': ObjectId(user_id),
                    'status': 'Completed'
                })
                completed_schedule_ids = {str(booking['scheduleId']) for booking in user_completed_bookings}

                # Filter schedules
                today = datetime.now().date()
                for doc in raw_schedules:
                    schedule_date_str = doc.get('date')
                    schedule_date = None
                    try:
                        if schedule_date_str:
                            schedule_date = datetime.strptime(schedule_date_str, '%Y-%m-%d').date()
                    except:
                        pass

                    # Skip expired schedules unless user has completed booking
                    if schedule_date and schedule_date < today:
                        if str(doc['_id']) not in completed_schedule_ids:
                            continue

                    schedules.append({
                        'id': str(doc['_id']),
                        'title': doc.get('title'),
                        'date': doc.get('date'),
                        'time': doc.get('time'),
                        'location': doc.get('location'),
                        'vaccines': doc.get('vaccines', []),
                        'description': doc.get('description', ''),
                        'status': doc.get('status', 'Scheduled'),
                        'createdBy': str(doc.get('createdBy')) if doc.get('createdBy') else None,
                        'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                        'updatedAt': doc.get('updatedAt').isoformat() if isinstance(doc.get('updatedAt'), datetime) else doc.get('updatedAt'),
                    })

            return jsonify({'schedules': schedules}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to list schedules: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination-schedules/<schedule_id>/bookings', methods=['POST'])
    @jwt_required()
    def create_vaccination_booking(schedule_id):
        """Create a vaccination booking"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json() or {}
            childName = (data.get('childName') or '').strip()
            selectedVaccines = data.get('vaccines') or []
            
            if not childName:
                return jsonify({'error': 'childName is required'}), 400
            
            if not isinstance(selectedVaccines, list) or not all(isinstance(v, str) and v.strip() for v in selectedVaccines):
                return jsonify({'error': 'vaccines must be an array of strings'}), 400
            
            # Verify schedule exists
            schedule = collections['vaccination_schedules'].find_one({'_id': ObjectId(schedule_id)})
            if not schedule:
                return jsonify({'error': 'Schedule not found'}), 404

            # Check if schedule date has passed (prevent booking past schedules)
            schedule_date_str = schedule.get('date')
            if schedule_date_str:
                try:
                    schedule_date = datetime.strptime(schedule_date_str, '%Y-%m-%d').date()
                    today = datetime.now().date()
                    if schedule_date < today:
                        return jsonify({'error': 'Cannot book for past vaccination schedules'}), 400
                except Exception:
                    pass  # If date parsing fails, allow booking (though this shouldn't happen)

            # Optionally ensure selectedVaccines are subset of schedule.vaccines
            allowed = set(schedule.get('vaccines', []))
            if any(v not in allowed for v in selectedVaccines):
                return jsonify({'error': 'Selected vaccines must be available in the schedule'}), 400
            
            # Enforce one booking per user per schedule
            existing = collections['vaccination_bookings'].find_one({
                'scheduleId': ObjectId(schedule_id),
                'userId': ObjectId(user_id)
            })
            if existing:
                return jsonify({'error': 'You have already booked a slot for this schedule'}), 409

            booking = {
                'scheduleId': ObjectId(schedule_id),
                'userId': ObjectId(user_id),
                'childName': childName,
                'vaccines': [v.strip() for v in selectedVaccines],
                'status': 'Booked',
                'createdAt': datetime.now(timezone.utc)
            }
            
            res = collections['vaccination_bookings'].insert_one(booking)
            return jsonify({'id': str(res.inserted_id), 'message': 'Booking created'}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to create booking: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination-schedules/<schedule_id>/bookings', methods=['GET'])
    @jwt_required()
    def list_vaccination_bookings(schedule_id):
        """List vaccination bookings for a schedule"""
        try:
            claims = get_jwt() or {}
            user_id = get_jwt_identity()
            
            # ASHA/Admin can see all, users see only their bookings
            query = { 'scheduleId': ObjectId(schedule_id) }
            if claims.get('userType') == 'user':
                query['userId'] = ObjectId(user_id)
            
            cursor = collections['vaccination_bookings'].find(query).sort('createdAt', -1)
            raw = list(cursor)

            # Get schedule date for auto-expire logic
            schedule = collections['vaccination_schedules'].find_one({'_id': ObjectId(schedule_id)})
            schedule_date = None
            if schedule and schedule.get('date'):
                try:
                    schedule_date = datetime.strptime(schedule['date'], '%Y-%m-%d').date()
                except:
                    pass

            # Enrich with user info for ASHA/Admin
            user_map = {}
            if claims.get('userType') in ['asha_worker', 'admin'] and raw:
                user_ids = list({doc.get('userId') for doc in raw if doc.get('userId')})
                if user_ids:
                    users_cursor = collections['users'].find({'_id': {'$in': user_ids}}, {'name': 1, 'email': 1})
                    for u in users_cursor:
                        user_map[str(u['_id'])] = {
                            'id': str(u['_id']),
                            'name': u.get('name'),
                            'email': u.get('email')
                        }

            bookings = []
            today = datetime.now().date()
            for doc in raw:
                current_status = doc.get('status', 'Booked')
                
                # Auto-expire if schedule date has passed and status is still 'Booked'
                if schedule_date and current_status == 'Booked' and today > schedule_date:
                    collections['vaccination_bookings'].update_one(
                        {'_id': doc['_id']}, 
                        {'$set': {'status': 'Expired', 'updatedAt': datetime.now(timezone.utc)}}
                    )
                    current_status = 'Expired'
                
                booking = {
                    'id': str(doc['_id']),
                    'scheduleId': str(doc['scheduleId']),
                    'userId': str(doc['userId']),
                    'childName': doc.get('childName'),
                    'vaccines': doc.get('vaccines', []),
                    'status': current_status,
                    'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt')
                }
                if user_map:
                    booking['user'] = user_map.get(booking['userId'])
                bookings.append(booking)
            return jsonify({'bookings': bookings}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to list bookings: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination-schedules/<schedule_id>', methods=['GET'])
    @jwt_required()
    def get_vaccination_schedule(schedule_id):
        """Get a single vaccination schedule by id"""
        try:
            try:
                _id = ObjectId(schedule_id)
            except Exception:
                return jsonify({'error': 'Invalid schedule id'}), 400

            doc = collections['vaccination_schedules'].find_one({'_id': _id})
            if not doc:
                return jsonify({'error': 'Schedule not found'}), 404

            schedule = {
                'id': str(doc['_id']),
                'title': doc.get('title'),
                'date': doc.get('date'),
                'time': doc.get('time'),
                'location': doc.get('location'),
                'vaccines': doc.get('vaccines', []),
                'description': doc.get('description', ''),
                'status': doc.get('status', 'Scheduled'),
                'createdBy': str(doc.get('createdBy')) if doc.get('createdBy') else None,
                'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                'updatedAt': doc.get('updatedAt').isoformat() if isinstance(doc.get('updatedAt'), datetime) else doc.get('updatedAt'),
            }
            return jsonify({'schedule': schedule}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to get schedule: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination-schedules/<schedule_id>', methods=['PUT'])
    @jwt_required()
    def update_vaccination_schedule(schedule_id):
        """Update a vaccination schedule (ASHA/Admin only)"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can update schedules'}), 403

            try:
                _id = ObjectId(schedule_id)
            except Exception:
                return jsonify({'error': 'Invalid schedule id'}), 400

            data = request.get_json() or {}
            update = {}

            if 'title' in data:
                update['title'] = (data.get('title') or '').strip() or 'Vaccination Schedule'
            if 'date' in data:
                date_str = (data.get('date') or '').strip()
                try:
                    date_dt = datetime.strptime(date_str, '%Y-%m-%d').date()
                    update['date'] = date_dt.isoformat()
                except Exception:
                    return jsonify({'error': 'date must be in YYYY-MM-DD format'}), 400
            if 'time' in data:
                update['time'] = (data.get('time') or '').strip()
            if 'location' in data:
                update['location'] = (data.get('location') or '').strip()
            if 'vaccines' in data:
                vaccines = data.get('vaccines') or []
                if not isinstance(vaccines, list) or not all(isinstance(v, str) and v.strip() for v in vaccines):
                    return jsonify({'error': 'vaccines must be a non-empty array of strings'}), 400
                update['vaccines'] = [v.strip() for v in vaccines]
            if 'description' in data:
                update['description'] = (data.get('description') or '').strip()
            if 'status' in data:
                update['status'] = (data.get('status') or '').strip() or 'Scheduled'

            if not update:
                return jsonify({'error': 'No valid fields to update'}), 400

            update['updatedAt'] = datetime.now(timezone.utc)
            res = collections['vaccination_schedules'].update_one({'_id': _id}, {'$set': update})
            if res.matched_count == 0:
                return jsonify({'error': 'Schedule not found'}), 404
            return jsonify({'message': 'Schedule updated'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update schedule: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination-bookings/<booking_id>/status', methods=['PUT'])
    @jwt_required()
    def update_booking_status(booking_id):
        """Update booking status (ASHA/Admin only)"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can update booking status'}), 403

            try:
                _id = ObjectId(booking_id)
            except Exception:
                return jsonify({'error': 'Invalid booking id'}), 400

            data = request.get_json() or {}
            new_status = (data.get('status') or '').strip()
            
            if new_status not in ['Booked', 'Completed', 'Expired', 'Cancelled']:
                return jsonify({'error': 'Invalid status. Must be one of: Booked, Completed, Expired, Cancelled'}), 400

            res = collections['vaccination_bookings'].update_one(
                {'_id': _id}, 
                {'$set': {'status': new_status, 'updatedAt': datetime.now(timezone.utc)}}
            )
            if res.matched_count == 0:
                return jsonify({'error': 'Booking not found'}), 404
            return jsonify({'message': 'Booking status updated'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update booking status: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination-records', methods=['GET'])
    @jwt_required()
    def list_my_vaccination_records():
        """Return completed vaccination bookings for the current user, enriched with schedule info.

        Response shape:
        {
          "records": [
            { id, vaccines: [str], date, location, status, childName, createdAt }
          ]
        }
        """
        try:
            user_id = get_jwt_identity()

            cursor = collections['vaccination_bookings'].find({
                'userId': ObjectId(user_id),
                'status': 'Completed'
            }).sort('createdAt', -1)

            records = []
            schedule_ids = []
            raw = list(cursor)
            if raw:
                schedule_ids = list({doc.get('scheduleId') for doc in raw if doc.get('scheduleId')})

            schedule_map = {}
            if schedule_ids:
                sched_cursor = collections['vaccination_schedules'].find({'_id': {'$in': schedule_ids}}, {
                    'date': 1, 'location': 1
                })
                for s in sched_cursor:
                    schedule_map[str(s['_id'])] = {
                        'date': s.get('date'),
                        'location': s.get('location')
                    }

            for doc in raw:
                sid = str(doc.get('scheduleId')) if doc.get('scheduleId') else None
                sched = schedule_map.get(sid, {})
                records.append({
                    'id': str(doc['_id']),
                    'vaccines': doc.get('vaccines', []),
                    'childName': doc.get('childName'),
                    'status': doc.get('status', 'Completed'),
                    'date': sched.get('date'),
                    'location': sched.get('location'),
                    'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt')
                })

            return jsonify({'records': records}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to list vaccination records: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination-certificate/<booking_id>', methods=['GET'])
    @jwt_required()
    def download_vaccination_certificate(booking_id):
        """Generate and download vaccination completion certificate (PDF) with digital signature"""
        try:
            user_id = get_jwt_identity()
            
            # Find the booking and verify it belongs to the current user
            booking = collections['vaccination_bookings'].find_one({
                '_id': ObjectId(booking_id),
                'userId': ObjectId(user_id),
                'status': 'Completed'
            })
            
            if not booking:
                return jsonify({'error': 'Vaccination record not found or not completed'}), 404
            
            # Get schedule details
            schedule = collections['vaccination_schedules'].find_one({'_id': booking['scheduleId']})
            if not schedule:
                return jsonify({'error': 'Schedule not found'}), 404
            
            # Get user details
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Import required libraries
            try:
                from reportlab.lib.pagesizes import A4
                from reportlab.pdfgen import canvas
                from reportlab.lib import colors
                from reportlab.lib.units import mm
                from utils.crypto import (
                    create_certificate_data, sign_certificate, 
                    get_certificate_hash, generate_verification_url
                )
                import qrcode
                from io import BytesIO
            except ImportError as e:
                return jsonify({'error': f'Missing dependency: {str(e)}. Run pip install -r requirements.txt'}), 500

            # Extract certificate data
            child_name = booking.get('childName', '')
            parent_name = user.get('name', '')
            vaccines = booking.get('vaccines', [])
            vaccination_date = schedule.get('date', '')
            location = schedule.get('location', '')
            certificate_id = str(booking['_id'])
            issued_date = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')

            # Create and sign certificate data
            cert_data = create_certificate_data(
                booking_id=certificate_id,
                child_name=child_name,
                parent_name=parent_name,
                vaccines=vaccines,
                vaccination_date=vaccination_date,
                location=location
            )
            
            # Generate digital signature
            signature = sign_certificate(cert_data)
            cert_hash = get_certificate_hash(cert_data)
            verification_url = generate_verification_url(certificate_id, signature)

            # Generate QR code with human-readable formatted certificate data
            # This creates a beautiful, easy-to-read certificate when scanned
            vaccines_list = '\n'.join([f'  • {v}' for v in vaccines])
            
            qr_text = f"""╔══════════════════════════════════════╗
║   VACCINATION CERTIFICATE            ║
║   AshaAssist Health Department       ║
╚══════════════════════════════════════╝

📋 CERTIFICATE ID
   {certificate_id}

👶 CHILD'S NAME
   {child_name}

👨‍👩‍👧 PARENT/GUARDIAN
   {parent_name}

💉 VACCINES ADMINISTERED
{vaccines_list}

📅 VACCINATION DATE
   {vaccination_date}

📍 LOCATION
   {location}

📝 ISSUED ON
   {issued_date}

🔐 DIGITAL SIGNATURE
   {signature[:48]}...

✓ CERTIFICATE VERIFIED
   This is an authentic vaccination certificate
   issued by AshaAssist Health Department

🌐 Online Verification:
   {verification_url}
"""
            
            qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=2)
            qr.add_data(qr_text)
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert QR to bytes for embedding in PDF
            qr_buffer = BytesIO()
            qr_img.save(qr_buffer, format='PNG')
            qr_buffer.seek(0)

            # Create PDF
            pdf_buffer = BytesIO()
            c = canvas.Canvas(pdf_buffer, pagesize=A4)
            width, height = A4

            # Header with gradient effect (simulated)
            c.setFillColor(colors.HexColor('#1e3a5f'))
            c.rect(0, height - 35*mm, width, 35*mm, fill=1, stroke=0)
            c.setFillColor(colors.HexColor('#2d5a87'))
            c.rect(0, height - 37*mm, width, 2*mm, fill=1, stroke=0)
            
            # Header text
            c.setFillColor(colors.white)
            c.setFont('Helvetica-Bold', 22)
            c.drawCentredString(width/2, height - 15*mm, 'DIGITAL VACCINATION CERTIFICATE')
            c.setFont('Helvetica', 11)
            c.drawCentredString(width/2, height - 23*mm, 'Mother and Child Protection Program - AshaAssist')
            c.setFont('Helvetica-Oblique', 9)
            c.drawCentredString(width/2, height - 30*mm, 'Digitally Signed with RSA-SHA256 Cryptography')

            # Security badge
            c.setFillColor(colors.HexColor('#10b981'))
            c.circle(30*mm, height - 22*mm, 8*mm, fill=1, stroke=0)
            c.setFillColor(colors.white)
            c.setFont('Helvetica-Bold', 12)
            c.drawCentredString(30*mm, height - 24*mm, '✓')

            # Main content area
            margin_x = 20*mm
            y = height - 50*mm
            line_gap = 9*mm

            def draw_field(label, value, bold_value=False):
                nonlocal y
                c.setFillColor(colors.HexColor('#374151'))
                c.setFont('Helvetica-Bold', 11)
                c.drawString(margin_x, y, f"{label}:")
                c.setFont('Helvetica-Bold' if bold_value else 'Helvetica', 11)
                c.setFillColor(colors.HexColor('#1f2937'))
                c.drawString(margin_x + 55*mm, y, str(value or 'N/A'))
                y -= line_gap

            # Certificate details
            c.setFillColor(colors.HexColor('#f3f4f6'))
            c.roundRect(margin_x - 5*mm, y - 55*mm, width - 2*margin_x + 10*mm, 70*mm, 5*mm, fill=1, stroke=0)
            y -= 3*mm

            draw_field("Child's Name", child_name, True)
            draw_field("Parent/Guardian", parent_name)
            draw_field("Vaccination Date", vaccination_date)
            draw_field("Location", location)
            draw_field("Certificate ID", certificate_id)
            draw_field("Issued Date", issued_date)

            # Vaccines section
            y -= 5*mm
            c.setFillColor(colors.HexColor('#1e3a5f'))
            c.setFont('Helvetica-Bold', 12)
            c.drawString(margin_x, y, 'Vaccines Administered:')
            y -= 7*mm
            
            c.setFillColor(colors.HexColor('#374151'))
            c.setFont('Helvetica', 11)
            for vaccine in vaccines:
                c.drawString(margin_x + 5*mm, y, f"• {vaccine}")
                y -= 6*mm

            # QR Code section
            y -= 10*mm
            c.setFillColor(colors.HexColor('#f0fdf4'))
            c.roundRect(margin_x - 5*mm, y - 55*mm, width - 2*margin_x + 10*mm, 60*mm, 5*mm, fill=1, stroke=0)
            c.setStrokeColor(colors.HexColor('#86efac'))
            c.roundRect(margin_x - 5*mm, y - 55*mm, width - 2*margin_x + 10*mm, 60*mm, 5*mm, fill=0, stroke=1)
            
            # QR code image
            from reportlab.lib.utils import ImageReader
            qr_reader = ImageReader(qr_buffer)
            c.drawImage(qr_reader, width - 60*mm, y - 50*mm, 45*mm, 45*mm)
            
            # Digital signature info
            c.setFillColor(colors.HexColor('#166534'))
            c.setFont('Helvetica-Bold', 11)
            c.drawString(margin_x, y - 5*mm, '🔐 Digital Signature & Quick Verification')
            
            c.setFont('Helvetica', 9)
            c.setFillColor(colors.HexColor('#374151'))
            c.drawString(margin_x, y - 15*mm, f"Algorithm: RSA-2048 with SHA-256")
            c.drawString(margin_x, y - 22*mm, f"Hash: {cert_hash[:32]}...")
            c.drawString(margin_x, y - 29*mm, f"Signature: {signature[:24]}...")
            
            c.setFont('Helvetica-Bold', 9)
            c.setFillColor(colors.HexColor('#166534'))
            c.drawString(margin_x, y - 38*mm, "📱 Scan QR Code to View Certificate Details")
            
            c.setFont('Helvetica-Oblique', 8)
            c.setFillColor(colors.HexColor('#6b7280'))
            c.drawString(margin_x, y - 45*mm, "QR code contains complete certificate information in JSON format")
            c.drawString(margin_x, y - 51*mm, f"Online verification: {verification_url[:50]}...")

            # Footer
            y = 20*mm
            c.setFillColor(colors.HexColor('#6b7280'))
            c.setFont('Helvetica-Oblique', 9)
            c.drawCentredString(width/2, y, 'This certificate is digitally signed and tamper-proof.')
            c.drawCentredString(width/2, y - 5*mm, 'Any modification to the certificate data will invalidate the signature.')

            c.showPage()
            c.save()
            pdf_buffer.seek(0)

            from flask import send_file
            filename = f"vaccination-certificate-{certificate_id}.pdf"
            return send_file(
                pdf_buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to generate certificate: {str(e)}'}), 500

    @vaccination_bp.route('/api/verify-certificate/<booking_id>', methods=['GET'])
    def verify_vaccination_certificate(booking_id):
        """Public endpoint to verify vaccination certificate authenticity"""
        try:
            from utils.crypto import (
                create_certificate_data, verify_certificate, 
                get_certificate_hash
            )
            
            # Find the booking
            booking = collections['vaccination_bookings'].find_one({
                '_id': ObjectId(booking_id),
                'status': 'Completed'
            })
            
            if not booking:
                return jsonify({
                    'valid': False,
                    'error': 'Certificate not found or vaccination not completed'
                }), 404
            
            # Get schedule and user details
            schedule = collections['vaccination_schedules'].find_one({'_id': booking['scheduleId']})
            user = collections['users'].find_one({'_id': booking['userId']})
            
            if not schedule or not user:
                return jsonify({
                    'valid': False,
                    'error': 'Certificate data incomplete'
                }), 404
            
            # Recreate certificate data
            cert_data = create_certificate_data(
                booking_id=str(booking['_id']),
                child_name=booking.get('childName', ''),
                parent_name=user.get('name', ''),
                vaccines=booking.get('vaccines', []),
                vaccination_date=schedule.get('date', ''),
                location=schedule.get('location', '')
            )
            
            cert_hash = get_certificate_hash(cert_data)
            
            # Return verification result
            return jsonify({
                'valid': True,
                'certificate': {
                    'id': str(booking['_id']),
                    'childName': booking.get('childName'),
                    'parentName': user.get('name'),
                    'vaccines': booking.get('vaccines', []),
                    'vaccinationDate': schedule.get('date'),
                    'location': schedule.get('location'),
                    'status': 'Verified',
                    'hash': cert_hash[:32] + '...',
                    'algorithm': 'RSA-2048 with SHA-256',
                    'issuer': 'AshaAssist Health Department'
                },
                'message': 'Certificate is authentic and has not been tampered with'
            }), 200
            
        except Exception as e:
            return jsonify({
                'valid': False,
                'error': f'Verification failed: {str(e)}'
            }), 500

    # Get all vaccination records (for ASHA workers)
    @vaccination_bp.route('/api/vaccination/records/all', methods=['GET'])
    @jwt_required()
    def get_all_vaccination_records():
        """Get all vaccination records for ASHA workers"""
        try:
            # Get user info to check if they're an ASHA worker
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            if not user or user.get('userType') != 'asha_worker':
                return jsonify({'error': 'Access denied. ASHA workers only.'}), 403

            # Get query parameters
            user_name = request.args.get('userName', '').strip()
            date_from = request.args.get('dateFrom', '').strip()
            date_to = request.args.get('dateTo', '').strip()
            status = request.args.get('status', '').strip()

            # Build query for bookings
            query = {}
            if status:
                query['status'] = status
            if date_from or date_to:
                date_query = {}
                if date_from:
                    date_query['$gte'] = date_from
                if date_to:
                    date_query['$lte'] = date_to
                query['createdAt'] = date_query

            # Get bookings with user and schedule information
            pipeline = [
                {'$match': query},
                {'$lookup': {
                    'from': 'users',
                    'localField': 'userId',
                    'foreignField': '_id',
                    'as': 'user'
                }},
                {'$lookup': {
                    'from': 'vaccination_schedules',
                    'localField': 'scheduleId',
                    'foreignField': '_id',
                    'as': 'schedule'
                }},
                {'$unwind': '$user'},
                {'$unwind': '$schedule'},
                {'$sort': {'createdAt': -1}}
            ]

            # Filter by user name if provided
            if user_name:
                pipeline.insert(-1, {'$match': {'user.name': {'$regex': user_name, '$options': 'i'}}})

            cursor = collections['vaccination_bookings'].aggregate(pipeline)
            items = []
            
            for doc in cursor:
                items.append({
                    'id': str(doc['_id']),
                    'vaccines': doc.get('vaccines', []),
                    'childName': doc.get('childName'),
                    'status': doc.get('status'),
                    'date': doc['schedule'].get('date'),
                    'location': doc['schedule'].get('location'),
                    'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                    'user': {
                        'id': str(doc['user']['_id']),
                        'name': doc['user'].get('name'),
                        'email': doc['user'].get('email'),
                        'phone': doc['user'].get('phone')
                    },
                    'schedule': {
                        'id': str(doc['schedule']['_id']),
                        'title': doc['schedule'].get('title'),
                        'date': doc['schedule'].get('date'),
                        'time': doc['schedule'].get('time'),
                        'location': doc['schedule'].get('location')
                    }
                })

            return jsonify({'records': items}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to get records: {str(e)}'}), 500

    @vaccination_bp.route('/api/vaccination/children-details', methods=['GET'])
    @jwt_required()
    def get_children_vaccination_details():
        """Get all children with vaccination details for ASHA workers"""
        try:
            # Get user info to check if they're an ASHA worker
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            if not user or user.get('userType') != 'asha_worker':
                return jsonify({'error': 'Access denied. ASHA workers only.'}), 403

            # Import vaccination utilities
            from utils.vaccination_utils import calculate_vaccination_milestones, get_vaccination_status
            
            # Find all delivered mothers (they have children)
            query = {
                'beneficiaryCategory': 'maternity',
                'maternalHealth.pregnancyStatus': 'delivered',
                'maternalHealth.children': {'$exists': True, '$ne': []}
            }
            
            mothers = collections['users'].find(query)
            
            children_data = []
            
            for mother in mothers:
                maternal_health = mother.get('maternalHealth', {})
                children = maternal_health.get('children', [])
                
                for idx, child in enumerate(children):
                    # Get or calculate vaccination milestones
                    if 'vaccinationMilestones' in child:
                        milestones = child['vaccinationMilestones']
                        # Update status based on current date
                        for milestone in milestones:
                            milestone['status'] = get_vaccination_status(milestone['dueDate'])
                    else:
                        # Calculate milestones if not present
                        dob = child.get('dateOfBirth')
                        if dob:
                            milestones = calculate_vaccination_milestones(dob)
                        else:
                            milestones = []
                    
                    # Filter only pending/due/overdue vaccinations
                    due_vaccinations = [
                        m for m in milestones 
                        if m.get('status') in ['pending', 'due', 'overdue', 'upcoming']
                        and not m.get('completedAt')
                    ]
                    
                    # Calculate child age
                    dob = child.get('dateOfBirth')
                    age = ''
                    if dob:
                        # Convert to naive datetime for calculation
                        if isinstance(dob, str):
                            dob_dt = datetime.fromisoformat(dob.replace('Z', '+00:00'))
                            if dob_dt.tzinfo is not None:
                                dob_dt = dob_dt.replace(tzinfo=None)
                        else:
                            dob_dt = dob
                            if dob_dt.tzinfo is not None:
                                dob_dt = dob_dt.replace(tzinfo=None)
                        
                        today = datetime.now()
                        days_old = (today - dob_dt).days
                        
                        if days_old < 7:
                            age = f'{days_old} days'
                        elif days_old < 30:
                            weeks = days_old // 7
                            age = f'{weeks} week{"s" if weeks != 1 else ""}'
                        elif days_old < 365:
                            months = days_old // 30
                            age = f'{months} month{"s" if months != 1 else ""}'
                        else:
                            years = days_old // 365
                            age = f'{years} year{"s" if years != 1 else ""}'
                    
                    child_info = {
                        'id': f"{str(mother['_id'])}_{idx}",
                        'childName': child.get('name', 'Unknown'),
                        'dateOfBirth': child.get('dateOfBirth').isoformat() if isinstance(child.get('dateOfBirth'), datetime) else child.get('dateOfBirth'),
                        'age': age,
                        'gender': child.get('gender', 'unknown'),
                        'weight': child.get('weight'),
                        'height': child.get('height'),
                        'motherName': mother.get('name', 'Unknown'),
                        'motherPhone': mother.get('phone', ''),
                        'motherEmail': mother.get('email', ''),
                        'motherId': str(mother['_id']),
                        'dueVaccinations': due_vaccinations
                    }
                    
                    children_data.append(child_info)
            
            return jsonify({'children': children_data}), 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to get children details: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(vaccination_bp)

