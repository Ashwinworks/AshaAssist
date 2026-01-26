"""
Community classes and local camps routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
import re

community_bp = Blueprint('community', __name__)


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def init_community_routes(app, collections):
    """Initialize community classes and local camps routes"""

    @community_bp.route('/api/community-classes', methods=['GET'])
    @jwt_required()
    def list_community_classes():
        try:
            # Filters: status, dateFrom, dateTo
            status = request.args.get('status')
            date_from = request.args.get('dateFrom')
            date_to = request.args.get('dateTo')
            query = {}
            if status:
                query['status'] = status
            if date_from or date_to:
                query['date'] = {}
                if date_from:
                    query['date']['$gte'] = date_from
                if date_to:
                    query['date']['$lte'] = date_to

            cursor = collections['community_classes'].find(query).sort('date', 1)
            items = []
            for doc in cursor:
                doc['id'] = str(doc.get('_id'))
                doc.pop('_id', None)
                doc['createdBy'] = str(doc.get('createdBy', ''))
                items.append(doc)
            return jsonify({'classes': items}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to list community classes: {str(e)}'}), 500

    @community_bp.route('/api/community-classes', methods=['POST'])
    @jwt_required()
    def create_community_class():
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can create classes'}), 403

            user_id = str(get_jwt_identity())
            data = request.get_json() or {}

            # Required minimal fields
            title = (data.get('title') or '').strip()
            date = (data.get('date') or '').strip()
            time = (data.get('time') or '').strip()
            location = (data.get('location') or '').strip()
            if not title or not date or not time or not location:
                return jsonify({'error': 'title, date, time, and location are required'}), 400

            # Validate date not in the past (YYYY-MM-DD)
            try:
                year, month, day = map(int, date.split('-'))
                date_obj = datetime(year, month, day)
                today = datetime.now(timezone.utc).date()
                if date_obj.date() < today:
                    return jsonify({'error': 'Cannot schedule classes on past dates'}), 400
            except Exception:
                return jsonify({'error': 'Invalid date format'}), 400

            doc = {
                'title': title,
                'category': (data.get('category') or 'General Health').strip(),
                'date': date,
                'time': time,
                'location': location,
                'instructor': (data.get('instructor') or '').strip(),
                'maxParticipants': int(data.get('maxParticipants') or 0),
                'registeredParticipants': int(data.get('registeredParticipants') or 0),
                'targetAudience': (data.get('targetAudience') or '').strip(),
                'status': (data.get('status') or 'Pending').strip(),
                'description': (data.get('description') or '').strip(),
                'topics': [t.strip() for t in (data.get('topics') or []) if isinstance(t, str) and t.strip()],
                'publishedDate': data.get('publishedDate') or date,
                'lastUpdated': data.get('lastUpdated') or _now_iso(),
                'createdBy': user_id,
                'createdAt': _now_iso(),
            }

            res = collections['community_classes'].insert_one(doc)
            doc['id'] = str(res.inserted_id)
            # Mirror to calendar events
            try:
                collections['calendar_events'].insert_one({
                    'title': f"Class: {title}",
                    'description': doc.get('description', ''),
                    'place': location,
                    'date': date,
                    'allDay': False,
                    'category': 'community_class',
                    'sourceType': 'community_class',
                    'sourceId': ObjectId(doc['id']),
                    'createdBy': ObjectId(user_id),
                    'createdAt': datetime.now(timezone.utc),
                    'updatedAt': datetime.now(timezone.utc)
                })
            except Exception:
                pass
            
            # Create notification for all users
            try:
                from routes.notifications import notify_all_users
                notify_all_users(
                    collections,
                    title=f"New Community Class: {title}",
                    message=f"A new community class has been scheduled on {date} at {time}" + (f" at {location}" if location else ""),
                    notification_type='event',
                    related_entity={'type': 'community_class', 'id': doc['id']}
                )
            except Exception as e:
                print(f"Warning: Could not create notification: {str(e)}")

            return jsonify({'message': 'Class created', 'class': doc}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to create class: {str(e)}'}), 500

    @community_bp.route('/api/local-camps', methods=['GET'])
    @jwt_required()
    def list_local_camps():
        try:
            status = request.args.get('status')
            date_from = request.args.get('dateFrom')
            date_to = request.args.get('dateTo')
            query = {}
            if status:
                query['status'] = status
            if date_from or date_to:
                query['date'] = {}
                if date_from:
                    query['date']['$gte'] = date_from
                if date_to:
                    query['date']['$lte'] = date_to

            cursor = collections['local_camps'].find(query).sort('date', 1)
            items = []
            for doc in cursor:
                doc['id'] = str(doc.get('_id'))
                doc.pop('_id', None)
                doc['createdBy'] = str(doc.get('createdBy', ''))
                items.append(doc)
            return jsonify({'camps': items}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to list local camps: {str(e)}'}), 500

    @community_bp.route('/api/local-camps', methods=['POST'])
    @jwt_required()
    def create_local_camp():
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can announce camps'}), 403

            user_id = str(get_jwt_identity())
            data = request.get_json() or {}

            title = (data.get('title') or '').strip()
            date = (data.get('date') or '').strip()
            time = (data.get('time') or '').strip()
            location = (data.get('location') or '').strip()
            if not title or not date or not time or not location:
                return jsonify({'error': 'title, date, time, and location are required'}), 400

            # Validate date not in the past (YYYY-MM-DD)
            try:
                year, month, day = map(int, date.split('-'))
                date_obj = datetime(year, month, day)
                today = datetime.now(timezone.utc).date()
                if date_obj.date() < today:
                    return jsonify({'error': 'Cannot schedule camps on past dates'}), 400
            except Exception:
                return jsonify({'error': 'Invalid date format'}), 400

            doc = {
                'title': title,
                'campType': (data.get('campType') or 'General').strip(),
                'date': date,
                'time': time,
                'location': location,
                'organizer': (data.get('organizer') or '').strip(),
                'services': [s.strip() for s in (data.get('services') or []) if isinstance(s, str) and s.strip()],
                'targetAudience': (data.get('targetAudience') or '').strip(),
                'expectedParticipants': int(data.get('expectedParticipants') or 0),
                'registeredParticipants': int(data.get('registeredParticipants') or 0),
                'status': (data.get('status') or 'Pending').strip(),
                'description': (data.get('description') or '').strip(),
                'requirements': (data.get('requirements') or '').strip(),
                'contactPerson': (data.get('contactPerson') or '').strip(),
                'publishedDate': data.get('publishedDate') or date,
                'lastUpdated': data.get('lastUpdated') or _now_iso(),
                'createdBy': user_id,
                'createdAt': _now_iso(),
            }

            res = collections['local_camps'].insert_one(doc)
            doc['id'] = str(res.inserted_id)
            # Mirror to calendar events
            try:
                collections['calendar_events'].insert_one({
                    'title': f"Camp: {title}",
                    'description': doc.get('description', ''),
                    'place': location,
                    'date': date,
                    'allDay': False,
                    'category': 'local_camp',
                    'sourceType': 'local_camp',
                    'sourceId': ObjectId(doc['id']),
                    'createdBy': ObjectId(user_id),
                    'createdAt': datetime.now(timezone.utc),
                    'updatedAt': datetime.now(timezone.utc)
                })
            except Exception:
                pass
            
            # Create notification for all users
            try:
                from routes.notifications import notify_all_users
                notify_all_users(
                    collections,
                    title=f"New Local Camp: {title}",
                    message=f"A new local camp has been announced on {date} at {time}" + (f" at {location}" if location else ""),
                    notification_type='event',
                    related_entity={'type': 'local_camp', 'id': doc['id']}
                )
            except Exception as e:
                print(f"Warning: Could not create notification: {str(e)}")

            return jsonify({'message': 'Camp announced', 'camp': doc}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to create camp: {str(e)}'}), 500

    @community_bp.route('/api/community-classes/<item_id>', methods=['PUT'])
    @jwt_required()
    def update_community_class(item_id):
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can update classes'}), 403

            data = request.get_json() or {}
            updates = {}
            for key in ['title','category','time','location','instructor','targetAudience','description','status']:
                if key in data:
                    updates[key] = (data.get(key) or '').strip()
            if 'maxParticipants' in data and data.get('maxParticipants') is not None:
                updates['maxParticipants'] = int(data.get('maxParticipants') or 0)
            if 'registeredParticipants' in data and data.get('registeredParticipants') is not None:
                updates['registeredParticipants'] = int(data.get('registeredParticipants') or 0)
            if 'topics' in data and isinstance(data.get('topics'), list):
                updates['topics'] = [str(t).strip() for t in data.get('topics') if str(t).strip()]
            if 'date' in data and data.get('date'):
                # validate not past
                try:
                    y,m,d = map(int, str(data.get('date')).split('-'))
                    date_obj = datetime(y,m,d)
                    if date_obj.date() < datetime.now(timezone.utc).date():
                        return jsonify({'error': 'Cannot schedule classes on past dates'}), 400
                    updates['date'] = str(data.get('date'))
                except Exception:
                    return jsonify({'error': 'Invalid date format'}), 400

            if not updates:
                return jsonify({'error': 'No updates provided'}), 400

            updates['lastUpdated'] = _now_iso()
            
            # Get the class details for notification
            class_doc = collections['community_classes'].find_one({'_id': ObjectId(item_id)})
            
            collections['community_classes'].update_one({'_id': ObjectId(item_id)}, {'$set': updates})

            # Update mirrored calendar event
            cal_updates = {}
            if 'title' in updates:
                cal_updates['title'] = f"Class: {updates['title']}"
            if 'description' in updates:
                cal_updates['description'] = updates['description']
            if 'location' in updates:
                cal_updates['place'] = updates['location']
            if 'date' in updates:
                cal_updates['date'] = updates['date']
            if cal_updates:
                cal_updates['updatedAt'] = datetime.now(timezone.utc)
                collections['calendar_events'].update_many({
                    'sourceType': 'community_class',
                    'sourceId': ObjectId(item_id)
                }, { '$set': cal_updates })
            
            # Create notification for all users about the update
            try:
                from routes.notifications import notify_all_users
                if class_doc:
                    class_title = updates.get('title', class_doc.get('title', 'Community Class'))
                    notify_all_users(
                        collections,
                        title=f"Class Updated: {class_title}",
                        message=f"The community class '{class_title}' has been updated. Please check for details.",
                        notification_type='event',
                        related_entity={'type': 'community_class', 'id': item_id}
                    )
            except Exception as e:
                print(f"Warning: Could not create notification: {str(e)}")

            return jsonify({ 'message': 'Class updated' }), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update class: {str(e)}'}), 500

    @community_bp.route('/api/local-camps/<item_id>', methods=['PUT'])
    @jwt_required()
    def update_local_camp(item_id):
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can update camps'}), 403

            data = request.get_json() or {}
            updates = {}
            for key in ['title','campType','time','location','organizer','targetAudience','contactPerson','requirements','description','status']:
                if key in data:
                    updates[key] = (data.get(key) or '').strip()
            if 'expectedParticipants' in data and data.get('expectedParticipants') is not None:
                updates['expectedParticipants'] = int(data.get('expectedParticipants') or 0)
            if 'registeredParticipants' in data and data.get('registeredParticipants') is not None:
                updates['registeredParticipants'] = int(data.get('registeredParticipants') or 0)
            if 'services' in data and isinstance(data.get('services'), list):
                updates['services'] = [str(s).strip() for s in data.get('services') if str(s).strip()]
            if 'date' in data and data.get('date'):
                # validate not past
                try:
                    y,m,d = map(int, str(data.get('date')).split('-'))
                    date_obj = datetime(y,m,d)
                    if date_obj.date() < datetime.now(timezone.utc).date():
                        return jsonify({'error': 'Cannot schedule camps on past dates'}), 400
                    updates['date'] = str(data.get('date'))
                except Exception:
                    return jsonify({'error': 'Invalid date format'}), 400

            if not updates:
                return jsonify({'error': 'No updates provided'}), 400

            updates['lastUpdated'] = _now_iso()
            
            # Get the camp details for notification
            camp_doc = collections['local_camps'].find_one({'_id': ObjectId(item_id)})
            
            collections['local_camps'].update_one({'_id': ObjectId(item_id)}, {'$set': updates})

            # Update mirrored calendar event
            cal_updates = {}
            if 'title' in updates:
                cal_updates['title'] = f"Camp: {updates['title']}"
            if 'description' in updates:
                cal_updates['description'] = updates['description']
            if 'location' in updates:
                cal_updates['place'] = updates['location']
            if 'date' in updates:
                cal_updates['date'] = updates['date']
            if cal_updates:
                cal_updates['updatedAt'] = datetime.now(timezone.utc)
                collections['calendar_events'].update_many({
                    'sourceType': 'local_camp',
                    'sourceId': ObjectId(item_id)
                }, { '$set': cal_updates })
            
            # Create notification for all users about the update
            try:
                from routes.notifications import notify_all_users
                if camp_doc:
                    camp_title = updates.get('title', camp_doc.get('title', 'Local Camp'))
                    notify_all_users(
                        collections,
                        title=f"Camp Updated: {camp_title}",
                        message=f"The local camp '{camp_title}' has been updated. Please check for details.",
                        notification_type='event',
                        related_entity={'type': 'local_camp', 'id': item_id}
                    )
            except Exception as e:
                print(f"Warning: Could not create notification: {str(e)}")

            return jsonify({ 'message': 'Camp updated' }), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update camp: {str(e)}'}), 500

    @community_bp.route('/api/community-classes/<item_id>', methods=['GET'])
    @jwt_required()
    def get_community_class(item_id):
        """Get a single community class by id"""
        try:
            try:
                _id = ObjectId(item_id)
            except Exception:
                return jsonify({'error': 'Invalid class id'}), 400

            doc = collections['community_classes'].find_one({'_id': _id})
            if not doc:
                return jsonify({'error': 'Class not found'}), 404

            # Convert ObjectId to string for JSON serialization
            doc['id'] = str(doc.get('_id'))
            doc.pop('_id', None)
            doc['createdBy'] = str(doc.get('createdBy', ''))

            return jsonify({'class': doc}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to get class: {str(e)}'}), 500

    @community_bp.route('/api/local-camps/<item_id>', methods=['GET'])
    @jwt_required()
    def get_local_camp(item_id):
        """Get a single local camp by id"""
        try:
            try:
                _id = ObjectId(item_id)
            except Exception:
                return jsonify({'error': 'Invalid camp id'}), 400

            doc = collections['local_camps'].find_one({'_id': _id})
            if not doc:
                return jsonify({'error': 'Camp not found'}), 404

            # Convert ObjectId to string for JSON serialization
            doc['id'] = str(doc.get('_id'))
            doc.pop('_id', None)
            doc['createdBy'] = str(doc.get('createdBy', ''))

            return jsonify({'camp': doc}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to get camp: {str(e)}'}), 500

    @community_bp.route('/api/community-classes/<item_id>', methods=['DELETE'])
    @jwt_required()
    def delete_community_class(item_id):
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can delete classes'}), 403

            # Fetch the document to enable fallback matching for older events
            doc = collections['community_classes'].find_one({'_id': ObjectId(item_id)})

            collections['community_classes'].delete_one({'_id': ObjectId(item_id)})

            # Remove related calendar events (support legacy events without sourceId/sourceType)
            or_filters = [
                { 'sourceType': 'community_class', 'sourceId': ObjectId(item_id) }
            ]
            if doc:
                safe_title = re.escape(doc.get('title', ''))
                or_filters.append({
                    'category': 'community_class',
                    'date': doc.get('date'),
                    'title': { '$regex': f'^Class:\s*{safe_title}$', '$options': 'i' }
                })
            collections['calendar_events'].delete_many({ '$or': or_filters })
            return jsonify({'message': 'Class deleted'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to delete class: {str(e)}'}), 500

    @community_bp.route('/api/local-camps/<item_id>', methods=['DELETE'])
    @jwt_required()
    def delete_local_camp(item_id):
        try:
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can delete camps'}), 403

            # Fetch the document to enable fallback matching for older events
            doc = collections['local_camps'].find_one({'_id': ObjectId(item_id)})

            collections['local_camps'].delete_one({'_id': ObjectId(item_id)})
            # Remove related calendar events (support legacy events without sourceId/sourceType)
            or_filters = [
                { 'sourceType': 'local_camp', 'sourceId': ObjectId(item_id) }
            ]
            if doc:
                safe_title = re.escape(doc.get('title', ''))
                or_filters.append({
                    'category': 'local_camp',
                    'date': doc.get('date'),
                    'title': { '$regex': f'^Camp:\s*{safe_title}$', '$options': 'i' }
                })
            collections['calendar_events'].delete_many({ '$or': or_filters })
            return jsonify({'message': 'Camp deleted'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to delete camp: {str(e)}'}), 500

    app.register_blueprint(community_bp)


