"""
Vaccination schedules and bookings management routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId

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
            # Public to all authenticated users
            # Optional filter by date >= today
            from_date = request.args.get('fromDate')  # YYYY-MM-DD
            query = {}
            if from_date:
                try:
                    _ = datetime.strptime(from_date, '%Y-%m-%d').date().isoformat()
                    query['date'] = { '$gte': _ }
                except Exception:
                    pass
            
            cursor = collections['vaccination_schedules'].find(query).sort('date', 1)
            schedules = []
            for doc in cursor:
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

    # Register blueprint with app
    app.register_blueprint(vaccination_bp)

