"""
WeeklyRationService: business logic for weekly ration distribution to maternity users
"""
from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any, List
from bson import ObjectId


class WeeklyRationService:
    def __init__(self, users_collection, weekly_rations_collection):
        self.users = users_collection
        self.weekly_rations = weekly_rations_collection

    def _get_week_start_date(self, date: datetime = None) -> str:
        """Get the Monday of the current week (or specified date's week)"""
        if date is None:
            date = datetime.now(timezone.utc)
        # Get the Monday of the week
        days_since_monday = date.weekday()
        monday = date - timedelta(days=days_since_monday)
        return monday.date().isoformat()

    def get_or_create_weekly_rations(self, week_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Get or create weekly ration records for all maternity users for a specific week"""
        if week_start_date is None:
            week_start_date = self._get_week_start_date()
        
        # Find all maternity users
        maternity_users = list(self.users.find({
            'beneficiaryCategory': 'maternity',
            'isActive': True
        }))

        ration_items = ['Rice 2kg', 'Wheat 1kg', 'Lentils 500g', 'Oil 500ml', 'Sugar 500g', 'Child Oil 100ml']

        # For each maternity user, get or create their weekly ration record
        for user in maternity_users:
            existing = self.weekly_rations.find_one({
                'userId': user['_id'],
                'weekStartDate': week_start_date
            })
            
            if not existing:
                # Create new ration record
                self.weekly_rations.insert_one({
                    'userId': user['_id'],
                    'weekStartDate': week_start_date,
                    'items': ration_items,
                    'status': 'pending',  # pending, collected
                    'collectionDate': None,
                    'createdAt': datetime.now(timezone.utc),
                    'updatedAt': datetime.now(timezone.utc)
                })

        return {'message': 'Weekly rations initialized'}, 200

    def get_rations_for_week(self, week_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Get all ration records for a specific week with user details"""
        if week_start_date is None:
            week_start_date = self._get_week_start_date()

        # Ensure rations exist for this week
        self.get_or_create_weekly_rations(week_start_date)

        # Aggregate to get ration records with user information
        pipeline = [
            {'$match': {'weekStartDate': week_start_date}},
            {'$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'user'
            }},
            {'$unwind': '$user'},
            {'$sort': {'status': 1, 'user.name': 1}}  # pending first, then by name
        ]

        cursor = self.weekly_rations.aggregate(pipeline)
        rations = []

        for doc in cursor:
            rations.append({
                'id': str(doc['_id']),
                'userId': str(doc['userId']),
                'userName': doc['user'].get('name', 'Unknown'),
                'userEmail': doc['user'].get('email', ''),
                'userPhone': doc['user'].get('phone', ''),
                'weekStartDate': doc.get('weekStartDate'),
                'items': doc.get('items', []),
                'status': doc.get('status', 'pending'),
                'collectionDate': doc.get('collectionDate'),
                'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                'updatedAt': doc.get('updatedAt').isoformat() if isinstance(doc.get('updatedAt'), datetime) else doc.get('updatedAt')
            })

        return {'rations': rations, 'weekStartDate': week_start_date}, 200

    def mark_ration_collected(self, user_id: str, week_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Mark a user's weekly ration as collected"""
        if week_start_date is None:
            week_start_date = self._get_week_start_date()

        # Find the ration record
        ration = self.weekly_rations.find_one({
            'userId': ObjectId(user_id),
            'weekStartDate': week_start_date
        })

        if not ration:
            # Create if doesn't exist
            self.get_or_create_weekly_rations(week_start_date)
            ration = self.weekly_rations.find_one({
                'userId': ObjectId(user_id),
                'weekStartDate': week_start_date
            })

        if ration.get('status') == 'collected':
            return {'error': 'Ration already marked as collected'}, 400

        # Update to collected
        result = self.weekly_rations.update_one(
            {'_id': ration['_id']},
            {
                '$set': {
                    'status': 'collected',
                    'collectionDate': datetime.now(timezone.utc).isoformat(),
                    'updatedAt': datetime.now(timezone.utc)
                }
            }
        )

        if result.modified_count == 0:
            return {'error': 'Failed to update ration status'}, 500

        return {'message': 'Ration marked as collected'}, 200

    def mark_ration_pending(self, user_id: str, week_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Mark a user's weekly ration as pending (undo collection)"""
        if week_start_date is None:
            week_start_date = self._get_week_start_date()

        # Find the ration record
        ration = self.weekly_rations.find_one({
            'userId': ObjectId(user_id),
            'weekStartDate': week_start_date
        })

        if not ration:
            return {'error': 'Ration record not found'}, 404

        # Update to pending
        result = self.weekly_rations.update_one(
            {'_id': ration['_id']},
            {
                '$set': {
                    'status': 'pending',
                    'collectionDate': None,
                    'updatedAt': datetime.now(timezone.utc)
                }
            }
        )

        if result.modified_count == 0:
            return {'error': 'Failed to update ration status'}, 500

        return {'message': 'Ration marked as pending'}, 200

    def get_user_ration_status(self, user_id: str, week_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Get a specific user's ration status for the week"""
        if week_start_date is None:
            week_start_date = self._get_week_start_date()

        # Ensure ration exists
        self.get_or_create_weekly_rations(week_start_date)

        ration = self.weekly_rations.find_one({
            'userId': ObjectId(user_id),
            'weekStartDate': week_start_date
        })

        if not ration:
            return {'error': 'Ration record not found'}, 404

        return {
            'ration': {
                'id': str(ration['_id']),
                'weekStartDate': ration.get('weekStartDate'),
                'items': ration.get('items', []),
                'status': ration.get('status', 'pending'),
                'collectionDate': ration.get('collectionDate'),
                'createdAt': ration.get('createdAt').isoformat() if isinstance(ration.get('createdAt'), datetime) else ration.get('createdAt')
            }
        }, 200
