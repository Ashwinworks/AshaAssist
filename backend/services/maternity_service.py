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

    def _calculate_visit_risk(self, vitals: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score-based risk classification using individual vital fields.
        Returns riskLevel ('low risk'|'mid risk'|'high risk'), confidence, and recommendations.
        """
        score = 0
        risk_factors = []

        systolic = vitals.get('systolicBP')
        diastolic = vitals.get('diastolicBP')
        bs = vitals.get('bloodSugar')
        temp = vitals.get('bodyTemp')
        heart_rate = vitals.get('heartRate')
        age = vitals.get('age')

        try:
            if systolic is not None and diastolic is not None:
                s, d = float(systolic), float(diastolic)
                if s >= 140 or d >= 90:
                    score += 3
                    risk_factors.append(f'High blood pressure ({s}/{d} mmHg)')
                elif s >= 130 or d >= 85:
                    score += 1
                    risk_factors.append(f'Elevated blood pressure ({s}/{d} mmHg)')
            if bs is not None:
                b = float(bs)
                if b >= 200:
                    score += 3
                    risk_factors.append(f'High blood sugar ({b} mg/dL)')
                elif b >= 126:
                    score += 1
                    risk_factors.append(f'Elevated blood sugar ({b} mg/dL)')
            if temp is not None and float(temp) >= 37.8:
                score += 2
                risk_factors.append(f'Elevated body temperature ({temp}°C)')
            if age is not None and float(age) >= 35:
                score += 1
                risk_factors.append('Advanced maternal age (≥35)')
            if heart_rate is not None and float(heart_rate) >= 90:
                score += 1
                risk_factors.append(f'Elevated heart rate ({heart_rate} bpm)')
        except (ValueError, TypeError):
            pass

        if score >= 5:
            risk_level = 'high risk'
            confidence = min(0.65 + score * 0.03, 0.95)
        elif score >= 2:
            risk_level = 'mid risk'
            confidence = min(0.60 + score * 0.03, 0.85)
        else:
            risk_level = 'low risk'
            confidence = 0.80

        recommendations = self._get_recommendations(risk_level)
        return {
            'riskLevel': risk_level,
            'riskConfidence': round(confidence * 100, 1),
            'riskFactors': risk_factors,
            'riskRecommendations': recommendations,
        }

    @staticmethod
    def _get_recommendations(risk_level: str) -> list:
        recs = {
            'low risk': [
                'Continue routine ANC check-ups as scheduled.',
                'Maintain a balanced diet rich in iron, folic acid, and calcium.',
                'Stay active with light walks and prenatal exercises.',
                'Monitor blood pressure and blood sugar at each visit.',
            ],
            'mid risk': [
                'Increase ANC visit frequency — consult your doctor about scheduling.',
                'Closely monitor blood pressure; use a home BP monitor if possible.',
                'Follow a low-sugar, low-salt diet and stay well-hydrated.',
                'Report any swelling, headaches, or vision changes to your ASHA worker immediately.',
                'Avoid strenuous activity and get adequate rest.',
            ],
            'high risk': [
                '⚠️ Seek medical attention promptly — do not delay your next check-up.',
                'Blood pressure and blood sugar must be monitored very closely.',
                "Follow your doctor's medication and dietary instructions strictly.",
                'Keep emergency contact numbers handy (ASHA worker, nearest hospital).',
                'Rest as much as possible and avoid any physical strain.',
                'Inform your family members about your risk status.',
            ],
        }
        return recs.get(risk_level, recs['low risk'])

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
        
        # Update LMP/EDD in maternalHealth (which should already exist from registration)
        if lmp:
            update['maternalHealth.lmp'] = lmp
        if edd:
            update['maternalHealth.edd'] = edd

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
                'doctorNotes': doc.get('doctorNotes', ''),
                'vitals': doc.get('vitals'),
                'riskLevel': doc.get('riskLevel'),
                'riskConfidence': doc.get('riskConfidence'),
                'riskFactors': doc.get('riskFactors', []),
                'riskRecommendations': doc.get('riskRecommendations', []),
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
        doctor_notes = (data.get('doctorNotes') or '').strip() or ''

        # Collect vitals (all optional)
        vitals_raw: Dict[str, Any] = {
            'systolicBP': data.get('systolicBP'),
            'diastolicBP': data.get('diastolicBP'),
            'bloodSugar': data.get('bloodSugar'),
            'bodyTemp': data.get('bodyTemp'),
            'heartRate': data.get('heartRate'),
            'age': data.get('age'),
        }
        has_vitals = any(v is not None and str(v).strip() != '' for v in vitals_raw.values())
        vitals = {k: v for k, v in vitals_raw.items() if v is not None} if has_vitals else None

        # Run risk prediction if vitals provided
        risk_data = self._calculate_visit_risk(vitals_raw) if has_vitals else None

        doc = {
            'userId': ObjectId(user_id),
            'visitDate': visit_date,
            'week': week,
            'center': center,
            'notes': notes,
            'doctorNotes': doctor_notes,
            'vitals': vitals,
            'createdAt': datetime.now(timezone.utc),
        }
        if risk_data:
            doc['riskLevel'] = risk_data['riskLevel']
            doc['riskConfidence'] = risk_data['riskConfidence']
            doc['riskFactors'] = risk_data['riskFactors']
            doc['riskRecommendations'] = risk_data['riskRecommendations']

        res = self.visits.insert_one(doc)
        response: Dict[str, Any] = {'id': str(res.inserted_id), 'message': 'Visit added'}
        if risk_data:
            response['riskResult'] = risk_data
        return response, 201

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
