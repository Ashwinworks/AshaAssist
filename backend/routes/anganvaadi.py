"""
Anganvaadi dashboard routes
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, timezone, timedelta
from bson import ObjectId

anganvaadi_bp = Blueprint('anganvaadi', __name__)


def init_anganvaadi_routes(app, collections):
    """Initialize Anganvaadi dashboard routes"""

    @anganvaadi_bp.route('/api/anganvaadi/dashboard-stats', methods=['GET'])
    @jwt_required()
    def get_dashboard_stats():
        """Get real-time dashboard statistics for Anganvaadi workers"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            
            # Only Anganvaadi workers can access this
            if user_type != 'anganvaadi':
                return jsonify({'error': 'Access denied'}), 403

            # Get current date and time ranges
            now = datetime.now(timezone.utc)
            today = now.date().isoformat()
            week_start = (now - timedelta(days=now.weekday())).date().isoformat()
            week_end = (now + timedelta(days=6-now.weekday())).date().isoformat()
            month_start = now.replace(day=1).date().isoformat()
            
            # 1. Count vaccination schedules this month
            try:
                vaccinations_scheduled = collections['vaccination_schedules'].count_documents({
                    'date': {'$gte': month_start}
                })
            except Exception as e:
                print(f"Error counting vaccinations: {e}")
                vaccinations_scheduled = 0

            # 2. Count classes scheduled for today
            try:
                classes_today = collections['community_classes'].count_documents({
                    'date': today,
                    'status': {'$in': ['Scheduled', 'Pending', 'Active']}
                })
            except Exception as e:
                print(f"Error counting classes: {e}")
                classes_today = 0

            # 3. Count ration distributions this month
            try:
                ration_distributions = collections['weekly_rations'].count_documents({
                    'weekStartDate': {'$gte': month_start},
                    'status': 'collected'
                })
            except Exception as e:
                print(f"Error counting rations: {e}")
                ration_distributions = 0

            # 4. Count camps this week
            try:
                camps_this_week = collections['local_camps'].count_documents({
                    'date': {'$gte': week_start, '$lte': week_end},
                    'status': {'$in': ['Scheduled', 'Pending', 'Active']}
                })
            except Exception as e:
                print(f"Error counting camps: {e}")
                camps_this_week = 0

            # 5. Get recent updates/alerts
            updates = []
            
            # Check for pending rations this week
            try:
                pending_rations = collections['weekly_rations'].count_documents({
                    'weekStartDate': {'$gte': week_start, '$lte': week_end},
                    'status': 'pending'
                })
                
                if pending_rations > 0:
                    updates.append({
                        'type': 'nutrition',
                        'title': 'Nutrition Program Update',
                        'message': f'Weekly ration supplies allocated for {pending_rations} families. Distribution in progress.',
                        'color': 'green'
                    })
            except Exception as e:
                print(f"Error checking pending rations: {e}")

            # Check for upcoming camps
            try:
                upcoming_camps = list(collections['local_camps'].find({
                    'date': {'$gte': today},
                    'status': {'$in': ['Scheduled', 'Pending']}
                }).sort('date', 1).limit(1))
                
                if upcoming_camps:
                    camp = upcoming_camps[0]
                    camp_date = camp.get('date', '')
                    camp_title = camp.get('title', 'Health Camp')
                    updates.append({
                        'type': 'camp',
                        'title': 'Community Health Camp',
                        'message': f'{camp_title} scheduled for {camp_date} at {camp.get("location", "center premises")}.',
                        'color': 'blue'
                    })
            except Exception as e:
                print(f"Error checking upcoming camps: {e}")

            # Check for upcoming classes
            try:
                upcoming_classes = list(collections['community_classes'].find({
                    'date': {'$gte': today},
                    'status': {'$in': ['Scheduled', 'Pending']}
                }).sort('date', 1).limit(1))
                
                if upcoming_classes and not updates:  # Only show if no other updates
                    class_item = upcoming_classes[0]
                    class_date = class_item.get('date', '')
                    class_title = class_item.get('title', 'Community Class')
                    updates.append({
                        'type': 'class',
                        'title': 'Upcoming Community Class',
                        'message': f'{class_title} scheduled for {class_date}.',
                        'color': 'purple'
                    })
            except Exception as e:
                print(f"Error checking upcoming classes: {e}")

            # If no updates, add a default message
            if not updates:
                updates.append({
                    'type': 'info',
                    'title': 'All Systems Running',
                    'message': 'No pending activities. All programs are running smoothly.',
                    'color': 'green'
                })

            return jsonify({
                'stats': {
                    'vaccinationsScheduled': vaccinations_scheduled,
                    'classesToday': classes_today,
                    'rationDistributions': ration_distributions,
                    'campsThisWeek': camps_this_week
                },
                'updates': updates
            }), 200

        except Exception as e:
            return jsonify({'error': f'Failed to fetch dashboard stats: {str(e)}'}), 500

    app.register_blueprint(anganvaadi_bp)
