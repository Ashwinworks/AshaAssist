"""
MaternityService: business logic for maternity profile and visits
"""
from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any, Optional
from bson import ObjectId


class MaternityService:
    def __init__(self, users_collection, visits_collection):
        self.users = users_collection
        self.visits = visits_collection

    def _parse_date(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        try:
            # Expect YYYY-MM-DD
            dt = datetime.strptime(value.strip(), '%Y-%m-%d').date()
            return dt.isoformat()
        except Exception:
            return None

    def set_maternity_profile(self, user_id: str, data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        lmp = self._parse_date(data.get('lmpDate'))
        edd = self._parse_date(data.get('eddDate'))
        update = {}
        if lmp is not None:
            update['maternity'] = update.get('maternity', {})
            update['maternity']['lmpDate'] = lmp
            # Auto-calc EDD if not provided (LMP + 280 days)
            if not edd and lmp:
                try:
                    lmp_dt = datetime.strptime(lmp, '%Y-%m-%d').date()
                    edd = (lmp_dt + timedelta(days=280)).isoformat()
                except Exception:
                    edd = None
        if edd is not None:
            update['maternity'] = update.get('maternity', {})
            update['maternity']['eddDate'] = edd

        if not update:
            return {'error': 'No valid fields to update'}, 400

        res = self.users.update_one({'_id': ObjectId(user_id)}, {'$set': update})
        if res.matched_count == 0:
            return {'error': 'User not found'}, 404
        return {'message': 'Profile updated', 'profile': update.get('maternity', {})}, 200

    def get_maternity_visits(self, user_id: str) -> Tuple[Dict[str, Any], int]:
        cursor = self.visits.find({'userId': ObjectId(user_id)}).sort('visitDate', 1)
        visits = []
        for doc in cursor:
            visits.append({
                'id': str(doc['_id']),
                'visitDate': doc.get('visitDate'),
                'week': doc.get('week'),
                'center': doc.get('center'),
                'notes': doc.get('notes', ''),
                'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
            })
        return {'visits': visits}, 200

    def add_maternity_visit(self, user_id: str, data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        visit_date = self._parse_date(data.get('visitDate'))
        if not visit_date:
            return {'error': 'visitDate must be YYYY-MM-DD'}, 400
        week = data.get('week')
        center = (data.get('center') or '').strip() or None
        notes = (data.get('notes') or '').strip() or ''

        doc = {
            'userId': ObjectId(user_id),
            'visitDate': visit_date,
            'week': week,
            'center': center,
            'notes': notes,
            'createdAt': datetime.now(timezone.utc),
        }
        res = self.visits.insert_one(doc)
        return {'id': str(res.inserted_id), 'message': 'Visit added'}, 201

    def delete_maternity_visit(self, user_id: str, visit_id: str) -> Tuple[Dict[str, Any], int]:
        try:
            _id = ObjectId(visit_id)
        except Exception:
            return {'error': 'Invalid visit id'}, 400
        res = self.visits.delete_one({'_id': _id, 'userId': ObjectId(user_id)})
        if res.deleted_count == 0:
            return {'error': 'Visit not found'}, 404
        return {'message': 'Visit deleted'}, 200

    def get_maternity_schedule(self, user_id: str) -> Tuple[Dict[str, Any], int]:
        # Simple schedule based on LMP stored in user doc
        user = self.users.find_one({'_id': ObjectId(user_id)})
        lmp = None
        if user:
            lmp = ((user.get('maternity') or {}).get('lmpDate'))
        if not lmp:
            return {'schedule': []}, 200
        try:
            lmp_dt = datetime.strptime(lmp, '%Y-%m-%d').date()
        except Exception:
            return {'schedule': []}, 200

        # Example ANC schedule weeks
        weeks = [12, 20, 28, 32, 36, 38]
        schedule = []
        for w in weeks:
            date_at_week = (lmp_dt + timedelta(weeks=w)).isoformat()
            schedule.append({'week': w, 'recommendedDate': date_at_week})
        return {'schedule': schedule}, 200














