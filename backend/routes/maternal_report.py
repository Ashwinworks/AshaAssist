"""
Maternal Report route — aggregates all data for a maternal user into a single report.
Used by ASHA workers to generate a one-click comprehensive report.
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta

maternal_report_bp = Blueprint('maternal_report', __name__)


def init_maternal_report_routes(app, collections):
    """Initialize maternal report routes with dependencies"""

    @maternal_report_bp.route('/api/maternal-report/<user_id>', methods=['GET'])
    @jwt_required()
    def get_maternal_report(user_id):
        """Get a comprehensive report of all data for a given maternal user."""
        try:
            # Verify the requester is an ASHA worker
            requester_id = get_jwt_identity()
            requester = collections['users'].find_one({'_id': ObjectId(requester_id)})
            if not requester or requester.get('userType') != 'asha_worker':
                return jsonify({'error': 'Access denied. ASHA workers only.'}), 403

            # Fetch the maternal user
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'error': 'User not found'}), 404

            # ------------------------------------------------------------------
            # 1. Profile
            # ------------------------------------------------------------------
            profile = {
                'id': str(user['_id']),
                'name': user.get('name', ''),
                'email': user.get('email', ''),
                'phone': user.get('phone', ''),
                'age': user.get('age'),
                'ward': user.get('ward', ''),
                'address': user.get('address', ''),
                'beneficiaryCategory': user.get('beneficiaryCategory', ''),
                'registeredAt': _fmt_dt(user.get('createdAt')),
            }

            # ------------------------------------------------------------------
            # 2. Pregnancy / Maternal Health
            # ------------------------------------------------------------------
            maternal_health = user.get('maternalHealth', {})
            maternity = user.get('maternity', {})
            lmp = maternal_health.get('lmp') or maternity.get('lmpDate')
            edd = maternal_health.get('edd') or maternity.get('eddDate')

            weeks_pregnant = None
            trimester = None
            if lmp:
                try:
                    lmp_dt = datetime.strptime(lmp, '%Y-%m-%d')
                    days = (datetime.utcnow() - lmp_dt).days
                    weeks_pregnant = max(0, days // 7)
                    if weeks_pregnant <= 12:
                        trimester = 1
                    elif weeks_pregnant <= 27:
                        trimester = 2
                    else:
                        trimester = 3
                except Exception:
                    pass

            pregnancy = {
                'lmp': lmp,
                'edd': edd,
                'status': maternal_health.get('pregnancyStatus', 'unknown'),
                'weeksPregnant': weeks_pregnant,
                'trimester': trimester,
                'deliveryDate': _fmt_dt(maternal_health.get('deliveryDate')),
                'deliveryDetails': maternal_health.get('deliveryDetails'),
            }

            # ------------------------------------------------------------------
            # 3. Children
            # ------------------------------------------------------------------
            children_raw = maternal_health.get('children', [])
            children = []
            for c in children_raw:
                children.append({
                    'name': c.get('name', ''),
                    'gender': c.get('gender', ''),
                    'weight': c.get('weight'),
                    'height': c.get('height'),
                    'dateOfBirth': _fmt_dt(c.get('dateOfBirth')),
                })

            # ------------------------------------------------------------------
            # 4. ANC Visits (from visits collection)
            # ------------------------------------------------------------------
            visits_cursor = collections['visits'].find(
                {'userId': ObjectId(user_id)}
            ).sort('visitDate', 1)
            anc_visits = []
            for v in visits_cursor:
                anc_visits.append({
                    'id': str(v['_id']),
                    'visitDate': v.get('visitDate'),
                    'week': v.get('week'),
                    'center': v.get('center'),
                    'notes': v.get('notes', ''),
                    'createdAt': _fmt_dt(v.get('createdAt')),
                })

            # ------------------------------------------------------------------
            # 5. PMSMA Government Benefits
            # ------------------------------------------------------------------
            pmsma_raw = user.get('governmentBenefits', {}).get('pmsma', {})
            pmsma = None
            if pmsma_raw:
                installments = pmsma_raw.get('installments', [])
                formatted_installments = []
                for inst in installments:
                    formatted_installments.append({
                        'number': inst.get('number'),
                        'name': inst.get('name', ''),
                        'amount': inst.get('amount'),
                        'status': inst.get('status', 'locked'),
                        'milestone': inst.get('milestone', ''),
                        'paidDate': _fmt_dt(inst.get('paidDate')),
                        'transactionId': inst.get('transactionId', ''),
                    })
                pmsma = {
                    'totalEligible': pmsma_raw.get('totalEligible', 0),
                    'totalPaid': pmsma_raw.get('totalPaid', 0),
                    'progress': pmsma_raw.get('progress', '0/3'),
                    'installments': formatted_installments,
                }

            # ------------------------------------------------------------------
            # 6. Vaccination Records (bookings + schedule lookup)
            # ------------------------------------------------------------------
            bookings_cursor = collections['vaccination_bookings'].find(
                {'userId': ObjectId(user_id)}
            ).sort('createdAt', -1)
            vaccination_records = []
            for bk in bookings_cursor:
                schedule = None
                schedule_id = bk.get('scheduleId')
                if schedule_id:
                    schedule = collections['vaccination_schedules'].find_one(
                        {'_id': ObjectId(schedule_id) if isinstance(schedule_id, str) else schedule_id}
                    )
                vaccination_records.append({
                    'id': str(bk['_id']),
                    'childName': bk.get('childName', ''),
                    'vaccines': bk.get('vaccines', schedule.get('vaccines', []) if schedule else []),
                    'status': bk.get('status', ''),
                    'date': schedule.get('date', '') if schedule else '',
                    'location': schedule.get('location', '') if schedule else '',
                    'createdAt': _fmt_dt(bk.get('createdAt')),
                })

            # ------------------------------------------------------------------
            # 7. Home Visits (visits to this user by ASHA workers)
            # ------------------------------------------------------------------
            home_cursor = collections['home_visits'].find(
                {'userId': user_id}
            ).sort('visitDate', -1)
            home_visits = []
            for hv in home_cursor:
                home_visits.append({
                    'id': str(hv['_id']),
                    'visitDate': _fmt_dt(hv.get('visitDate')),
                    'visitNotes': hv.get('visitNotes', ''),
                    'verified': hv.get('verified', False),
                    'status': hv.get('status', ''),
                })

            # ------------------------------------------------------------------
            # Build Response
            # ------------------------------------------------------------------
            report = {
                'generatedAt': datetime.utcnow().isoformat(),
                'generatedBy': requester.get('name', 'ASHA Worker'),
                'profile': profile,
                'pregnancy': pregnancy,
                'children': children,
                'ancVisits': anc_visits,
                'pmsma': pmsma,
                'vaccinationRecords': vaccination_records,
                'homeVisits': home_visits,
            }

            return jsonify({'report': report}), 200

        except Exception as e:
            return jsonify({'error': f'Failed to generate report: {str(e)}'}), 500

    app.register_blueprint(maternal_report_bp)


def _fmt_dt(value):
    """Helper to format a datetime or date string for JSON output."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)
