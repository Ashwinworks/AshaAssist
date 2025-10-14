"""
MonthlyRationService: business logic for monthly ration distribution to maternity users
"""
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, List
from bson import ObjectId


class MonthlyRationService:
    def __init__(self, users_collection, monthly_rations_collection):
        self.users = users_collection
        self.monthly_rations = monthly_rations_collection

    def _get_month_start_date(self, date: datetime = None) -> str:
        """Get the first day of the current month (or specified date's month)"""
        if date is None:
            date = datetime.now(timezone.utc)
        # Get the first day of the month
        first_day = date.replace(day=1)
        return first_day.date().isoformat()

    def get_or_create_monthly_rations(self, month_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Get or create monthly ration records for all maternity users for a specific month"""
        if month_start_date is None:
            month_start_date = self._get_month_start_date()
        
        # Find all maternity users
        maternity_users = list(self.users.find({
            'beneficiaryCategory': 'maternity',
            'isActive': True
        }))

        # Monthly ration items (increased quantities for monthly distribution)
        ration_items = ['Rice 8kg', 'Wheat 4kg', 'Lentils 2kg', 'Oil 2L', 'Sugar 2kg', 'Child Oil 400ml']

        # For each maternity user, get or create their monthly ration record
        for user in maternity_users:
            existing = self.monthly_rations.find_one({
                'userId': user['_id'],
                'monthStartDate': month_start_date
            })
            
            if not existing:
                # Create new ration record
                self.monthly_rations.insert_one({
                    'userId': user['_id'],
                    'monthStartDate': month_start_date,
                    'items': ration_items,
                    'status': 'pending',  # pending, collected
                    'collectionDate': None,
                    'createdAt': datetime.now(timezone.utc),
                    'updatedAt': datetime.now(timezone.utc)
                })

        return {'message': 'Monthly rations initialized'}, 200

    def get_rations_for_month(self, month_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Get all ration records for a specific month with user details"""
        if month_start_date is None:
            month_start_date = self._get_month_start_date()

        # Ensure rations exist for this month
        self.get_or_create_monthly_rations(month_start_date)

        # Aggregate to get ration records with user information
        pipeline = [
            {'$match': {'monthStartDate': month_start_date}},
            {'$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'user'
            }},
            {'$unwind': '$user'},
            {'$sort': {'status': 1, 'user.name': 1}}  # pending first, then by name
        ]

        cursor = self.monthly_rations.aggregate(pipeline)
        rations = []

        for doc in cursor:
            rations.append({
                'id': str(doc['_id']),
                'userId': str(doc['userId']),
                'userName': doc['user'].get('name', 'Unknown'),
                'userEmail': doc['user'].get('email', ''),
                'userPhone': doc['user'].get('phone', ''),
                'monthStartDate': doc.get('monthStartDate'),
                'items': doc.get('items', []),
                'status': doc.get('status', 'pending'),
                'collectionDate': doc.get('collectionDate'),
                'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                'updatedAt': doc.get('updatedAt').isoformat() if isinstance(doc.get('updatedAt'), datetime) else doc.get('updatedAt')
            })

        return {'rations': rations, 'monthStartDate': month_start_date}, 200

    def mark_ration_collected(self, user_id: str, month_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Mark a user's monthly ration as collected"""
        if month_start_date is None:
            month_start_date = self._get_month_start_date()

        # Find the ration record
        ration = self.monthly_rations.find_one({
            'userId': ObjectId(user_id),
            'monthStartDate': month_start_date
        })

        if not ration:
            # Create if doesn't exist
            self.get_or_create_monthly_rations(month_start_date)
            ration = self.monthly_rations.find_one({
                'userId': ObjectId(user_id),
                'monthStartDate': month_start_date
            })

        if ration.get('status') == 'collected':
            return {'error': 'Ration already marked as collected'}, 400

        # Update to collected
        result = self.monthly_rations.update_one(
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

    def mark_ration_pending(self, user_id: str, month_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Mark a user's monthly ration as pending (undo collection)"""
        if month_start_date is None:
            month_start_date = self._get_month_start_date()

        # Find the ration record
        ration = self.monthly_rations.find_one({
            'userId': ObjectId(user_id),
            'monthStartDate': month_start_date
        })

        if not ration:
            return {'error': 'Ration record not found'}, 404

        # Update to pending
        result = self.monthly_rations.update_one(
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

    def get_user_ration_status(self, user_id: str, month_start_date: str = None) -> Tuple[Dict[str, Any], int]:
        """Get a specific user's ration status for the month"""
        if month_start_date is None:
            month_start_date = self._get_month_start_date()

        # Ensure ration exists
        self.get_or_create_monthly_rations(month_start_date)

        ration = self.monthly_rations.find_one({
            'userId': ObjectId(user_id),
            'monthStartDate': month_start_date
        })

        if not ration:
            return {'error': 'Ration record not found'}, 404

        return {
            'ration': {
                'id': str(ration['_id']),
                'monthStartDate': ration.get('monthStartDate'),
                'items': ration.get('items', []),
                'status': ration.get('status', 'pending'),
                'collectionDate': ration.get('collectionDate'),
                'createdAt': ration.get('createdAt').isoformat() if isinstance(ration.get('createdAt'), datetime) else ration.get('createdAt')
            }
        }, 200

    def get_ration_history(self) -> Tuple[Dict[str, Any], int]:
        """Get all ration records across all months with user details"""
        # Aggregate to get all ration records with user information
        pipeline = [
            {'$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'user'
            }},
            {'$unwind': '$user'},
            {'$sort': {'monthStartDate': -1, 'user.name': 1}}  # Most recent first, then by name
        ]

        cursor = self.monthly_rations.aggregate(pipeline)
        rations = []

        for doc in cursor:
            rations.append({
                'id': str(doc['_id']),
                'userId': str(doc['userId']),
                'userName': doc['user'].get('name', 'Unknown'),
                'userEmail': doc['user'].get('email', ''),
                'userPhone': doc['user'].get('phone', ''),
                'monthStartDate': doc.get('monthStartDate'),
                'items': doc.get('items', []),
                'status': doc.get('status', 'pending'),
                'collectionDate': doc.get('collectionDate'),
                'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                'updatedAt': doc.get('updatedAt').isoformat() if isinstance(doc.get('updatedAt'), datetime) else doc.get('updatedAt')
            })

        return {'rations': rations}, 200
