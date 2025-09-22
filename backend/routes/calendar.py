"""
Calendar management routes for events and scheduling
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
from utils.helpers import parse_datetime

# Create blueprint
calendar_bp = Blueprint('calendar', __name__)

def init_calendar_routes(app, collections):
    """Initialize calendar routes with dependencies"""
    
    @calendar_bp.route('/api/calendar-events', methods=['GET'])
    @jwt_required()
    def list_calendar_events():
        """List calendar events with optional month filter"""
        try:
            # Optional month filter: ?month=YYYY-MM
            month = request.args.get('month')
            query = {}
            if month:
                try:
                    year, mon = map(int, month.split('-'))
                    start = datetime(year, mon, 1)
                    # next month
                    if mon == 12:
                        end = datetime(year + 1, 1, 1)
                    else:
                        end = datetime(year, mon + 1, 1)
                    query = {'date': {'$gte': start.date().isoformat(), '$lt': end.date().isoformat()}}
                except Exception:
                    pass
            
            cursor = collections['calendar_events'].find(query).sort('date', 1)
            events = []
            for doc in cursor:
                # Handle both old format (start/end) and new format (date)
                if doc.get('date'):
                    event_date = doc.get('date')
                    if isinstance(event_date, datetime):
                        event_date = event_date.date().isoformat()
                elif doc.get('start'):
                    start_dt = doc.get('start')
                    if isinstance(start_dt, datetime):
                        event_date = start_dt.date().isoformat()
                    else:
                        event_date = start_dt.split('T')[0] if 'T' in str(start_dt) else str(start_dt)
                else:
                    event_date = None

                events.append({
                    'id': str(doc['_id']),
                    'title': doc.get('title', ''),
                    'description': doc.get('description', ''),
                    'place': doc.get('place', ''),
                    'date': event_date,
                    'allDay': bool(doc.get('allDay', False)),
                    'category': doc.get('category', ''),
                    'createdBy': str(doc.get('createdBy')) if doc.get('createdBy') else None,
                    'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                })
            return jsonify({'events': events}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to load events: {str(e)}'}), 500

    @calendar_bp.route('/api/calendar-events', methods=['POST'])
    @jwt_required()
    def create_calendar_event():
        """Create a new calendar event"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can manage events'}), 403
            
            user_id = get_jwt_identity()
            data = request.get_json() or {}
            title = (data.get('title') or '').strip()
            event_date = data.get('date')

            if not title or not event_date:
                return jsonify({'error': 'Title and date are required'}), 400

            # Validate date format and prevent past dates
            try:
                if isinstance(event_date, str):
                    # Parse YYYY-MM-DD format
                    year, month, day = map(int, event_date.split('-'))
                    date_obj = datetime(year, month, day)
                else:
                    date_obj = event_date

                # Check if date is in the past
                today = datetime.now(timezone.utc).date()
                if date_obj.date() < today:
                    return jsonify({'error': 'Cannot schedule events on past dates'}), 400

            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid date format'}), 400

            doc = {
                'title': title,
                'description': (data.get('description') or '').strip(),
                'place': (data.get('place') or '').strip(),
                'date': event_date,  # Store as string YYYY-MM-DD
                'allDay': bool(data.get('allDay', False)),
                'category': (data.get('category') or '').strip(),
                'createdBy': ObjectId(user_id),
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc)
            }
            
            res = collections['calendar_events'].insert_one(doc)
            return jsonify({'id': str(res.inserted_id), 'message': 'Event created'}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to create event: {str(e)}'}), 500

    @calendar_bp.route('/api/calendar-events/<event_id>', methods=['PUT'])
    @jwt_required()
    def update_calendar_event(event_id):
        """Update an existing calendar event"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can manage events'}), 403
            
            data = request.get_json() or {}
            updates = {}

            for field in ['title', 'description', 'place', 'category']:
                if field in data:
                    updates[field] = (data.get(field) or '').strip()

            if 'date' in data:
                try:
                    event_date = data['date']
                    if isinstance(event_date, str):
                        # Parse YYYY-MM-DD format
                        year, month, day = map(int, event_date.split('-'))
                        date_obj = datetime(year, month, day)
                    else:
                        date_obj = event_date

                    # Check if date is in the past
                    today = datetime.now(timezone.utc).date()
                    if date_obj.date() < today:
                        return jsonify({'error': 'Cannot schedule events on past dates'}), 400

                    updates['date'] = event_date  # Store as string YYYY-MM-DD
                except (ValueError, TypeError):
                    return jsonify({'error': 'Invalid date format'}), 400

            if 'allDay' in data:
                updates['allDay'] = bool(data['allDay'])
            
            if not updates:
                return jsonify({'error': 'No updates provided'}), 400
            
            updates['updatedAt'] = datetime.now(timezone.utc)
            collections['calendar_events'].update_one({'_id': ObjectId(event_id)}, {'$set': updates})
            return jsonify({'message': 'Event updated'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update event: {str(e)}'}), 500

    @calendar_bp.route('/api/calendar-events/<event_id>', methods=['DELETE'])
    @jwt_required()
    def delete_calendar_event(event_id):
        """Delete a calendar event"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can manage events'}), 403
            
            collections['calendar_events'].delete_one({'_id': ObjectId(event_id)})
            return jsonify({'message': 'Event deleted'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to delete event: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(calendar_bp)
