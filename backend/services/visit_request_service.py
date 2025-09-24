"""
Visit Request Service: business logic for visit requests
"""
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, List, Optional
from bson import ObjectId


class VisitRequestService:
    def __init__(self, users_collection, visit_requests_collection):
        self.users = users_collection
        self.visit_requests = visit_requests_collection

    def create_visit_request(self, user_id: str, data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        """Create a new visit request"""
        try:
            # Validate required fields
            required_fields = ['requestType', 'reason', 'address']
            for field in required_fields:
                if not data.get(field) or not data.get(field).strip():
                    return {'error': f'{field} is required'}, 400

            request_type = data.get('requestType').strip()
            if request_type not in ['maternity', 'palliative']:
                return {'error': 'requestType must be either maternity or palliative'}, 400

            priority = data.get('priority', 'Medium').strip()
            if priority not in ['Urgent', 'High', 'Medium']:
                priority = 'Medium'

            # Get user information
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404

            # Create visit request document
            visit_request = {
                'userId': ObjectId(user_id),
                'requestType': request_type,
                'priority': priority,
                'reason': data.get('reason').strip(),
                'address': data.get('address').strip(),
                'phone': data.get('phone', user.get('phone', '')).strip(),
                'requestedDate': data.get('requestedDate', '').strip() or None,
                'status': 'Pending',
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc)
            }

            result = self.visit_requests.insert_one(visit_request)
            return {
                'id': str(result.inserted_id),
                'message': 'Visit request submitted successfully',
                'request': {
                    'id': str(result.inserted_id),
                    'requestType': request_type,
                    'priority': priority,
                    'reason': visit_request['reason'],
                    'address': visit_request['address'],
                    'phone': visit_request['phone'],
                    'requestedDate': visit_request['requestedDate'],
                    'status': visit_request['status'],
                    'createdAt': visit_request['createdAt'].isoformat()
                }
            }, 201

        except Exception as e:
            return {'error': f'Failed to create visit request: {str(e)}'}, 500

    def get_user_visit_requests(self, user_id: str) -> Tuple[Dict[str, Any], int]:
        """Get all visit requests for a user"""
        try:
            cursor = self.visit_requests.find({'userId': ObjectId(user_id)}).sort('createdAt', -1)
            requests = []
            for doc in cursor:
                request_data = {
                    'id': str(doc['_id']),
                    'requestType': doc.get('requestType'),
                    'priority': doc.get('priority'),
                    'reason': doc.get('reason'),
                    'address': doc.get('address'),
                    'phone': doc.get('phone'),
                    'requestedDate': doc.get('requestedDate'),
                    'status': doc.get('status'),
                    'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                    'updatedAt': doc.get('updatedAt').isoformat() if isinstance(doc.get('updatedAt'), datetime) else doc.get('updatedAt')
                }

                # Add scheduled information if available
                if doc.get('scheduledDateTime'):
                    request_data['scheduledDateTime'] = doc['scheduledDateTime'].isoformat()
                    request_data['scheduledDate'] = doc['scheduledDateTime'].strftime('%Y-%m-%d')
                    request_data['scheduledTime'] = doc['scheduledDateTime'].strftime('%H:%M')

                requests.append(request_data)
            return {'requests': requests}, 200
        except Exception as e:
            return {'error': f'Failed to fetch visit requests: {str(e)}'}, 500

    def get_visit_requests_for_asha(self, asha_user_id: str = None, filters: Dict[str, Any] = None) -> Tuple[Dict[str, Any], int]:
        """Get visit requests for ASHA worker (with user details)"""
        try:
            query = {}
            if filters:
                if filters.get('status'):
                    query['status'] = filters['status']
                if filters.get('requestType'):
                    query['requestType'] = filters['requestType']
                if filters.get('priority'):
                    query['priority'] = filters['priority']

            # Get visit requests with user information
            pipeline = [
                {'$match': query},
                {'$lookup': {
                    'from': 'users',
                    'localField': 'userId',
                    'foreignField': '_id',
                    'as': 'user'
                }},
                {'$unwind': '$user'},
                {'$sort': {'createdAt': -1}}
            ]

            cursor = self.visit_requests.aggregate(pipeline)
            requests = []
            for doc in cursor:
                request_data = {
                    'id': str(doc['_id']),
                    'familyName': doc['user'].get('name', 'Unknown'),
                    'requestType': doc.get('requestType'),
                    'priority': doc.get('priority'),
                    'reason': doc.get('reason'),
                    'address': doc.get('address'),
                    'phone': doc.get('phone'),
                    'requestedDate': doc.get('requestedDate'),
                    'status': doc.get('status'),
                    'submittedAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                    'userId': str(doc['userId'])
                }

                # Add scheduled information if available
                if doc.get('scheduledDateTime'):
                    request_data['scheduledDateTime'] = doc['scheduledDateTime'].isoformat()
                    request_data['scheduledDate'] = doc['scheduledDateTime'].strftime('%Y-%m-%d')
                    request_data['scheduledTime'] = doc['scheduledDateTime'].strftime('%H:%M')

                requests.append(request_data)

            return {'requests': requests}, 200
        except Exception as e:
            return {'error': f'Failed to fetch visit requests: {str(e)}'}, 500

    def update_visit_request_status(self, request_id: str, new_status: str, asha_user_id: str = None, scheduled_date: str = None, scheduled_time: str = None) -> Tuple[Dict[str, Any], int]:
        """Update visit request status (for ASHA workers)"""
        try:
            if new_status not in ['Pending', 'Approved', 'Rejected', 'Completed', 'Scheduled']:
                return {'error': 'Invalid status'}, 400

            update_data = {
                'status': new_status,
                'updatedAt': datetime.now(timezone.utc)
            }

            # If approving, add approved timestamp
            if new_status == 'Approved':
                update_data['approvedAt'] = datetime.now(timezone.utc)
                if asha_user_id:
                    update_data['approvedBy'] = ObjectId(asha_user_id)

            # If scheduling, add scheduled date/time
            if new_status == 'Scheduled':
                if not scheduled_date:
                    return {'error': 'Scheduled date is required'}, 400

                # Combine date and time into datetime object
                try:
                    if scheduled_time:
                        # Parse date and time, combine them
                        from datetime import datetime as dt
                        scheduled_datetime = dt.fromisoformat(f"{scheduled_date}T{scheduled_time}")
                        update_data['scheduledDateTime'] = scheduled_datetime
                    else:
                        # Use date only, default time to start of day
                        from datetime import datetime as dt
                        scheduled_datetime = dt.fromisoformat(f"{scheduled_date}T00:00:00")
                        update_data['scheduledDateTime'] = scheduled_datetime

                    update_data['scheduledBy'] = ObjectId(asha_user_id) if asha_user_id else None
                except ValueError as e:
                    return {'error': f'Invalid date/time format: {str(e)}'}, 400

            result = self.visit_requests.update_one(
                {'_id': ObjectId(request_id)},
                {'$set': update_data}
            )

            if result.matched_count == 0:
                return {'error': 'Visit request not found'}, 404

            return {'message': f'Visit request {new_status.lower()}'}, 200
        except Exception as e:
            return {'error': f'Failed to update visit request: {str(e)}'}, 500

    def get_visit_request_stats(self) -> Tuple[Dict[str, Any], int]:
        """Get visit request statistics for dashboard"""
        try:
            pipeline = [
                {'$group': {
                    '_id': '$status',
                    'count': {'$sum': 1}
                }}
            ]
            stats = {doc['_id']: doc['count'] for doc in self.visit_requests.aggregate(pipeline)}

            return {
                'stats': {
                    'pending': stats.get('Pending', 0),
                    'approved': stats.get('Approved', 0),
                    'rejected': stats.get('Rejected', 0),
                    'completed': stats.get('Completed', 0),
                    'total': sum(stats.values())
                }
            }, 200
        except Exception as e:
            return {'error': f'Failed to get stats: {str(e)}'}, 500