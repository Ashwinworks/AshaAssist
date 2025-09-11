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
                    query = {'start': {'$lt': end}, 'end': {'$gte': start}}
                except Exception:
                    pass
            
            cursor = collections['calendar_events'].find(query).sort('start', 1)
            events = []
            for doc in cursor:
                events.append({
                    'id': str(doc['_id']),
                    'title': doc.get('title', ''),
                    'description': doc.get('description', ''),
                    'place': doc.get('place', ''),
                    'start': doc.get('start').isoformat() if isinstance(doc.get('start'), datetime) else doc.get('start'),
                    'end': doc.get('end').isoformat() if isinstance(doc.get('end'), datetime) else doc.get('end'),
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
            start = data.get('start')
            end = data.get('end') or start
            
            if not title or not start:
                return jsonify({'error': 'Title and start are required'}), 400
            
            # Parse dates
            start_dt = parse_datetime(start)
            end_dt = parse_datetime(end)
            
            if not start_dt or not end_dt:
                return jsonify({'error': 'Invalid start/end datetime'}), 400
            
            doc = {
                'title': title,
                'description': (data.get('description') or '').strip(),
                'place': (data.get('place') or '').strip(),
                'start': start_dt,
                'end': end_dt,
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
            
            if 'start' in data:
                dt = parse_datetime(data['start'])
                if not dt: 
                    return jsonify({'error': 'Invalid start'}), 400
                updates['start'] = dt
            
            if 'end' in data:
                dt = parse_datetime(data['end'])
                if not dt: 
                    return jsonify({'error': 'Invalid end'}), 400
                updates['end'] = dt
            
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
