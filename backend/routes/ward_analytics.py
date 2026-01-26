"""
Ward Analytics routes for admin dashboard
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, timezone, timedelta
from bson import ObjectId

# Create blueprint
ward_analytics_bp = Blueprint('ward_analytics', __name__)

def init_ward_analytics_routes(app, collections):
    """Initialize ward analytics routes with dependencies"""
    
    def require_admin():
        """Check if user is admin"""
        claims = get_jwt() or {}
        if claims.get('userType') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return None

    @ward_analytics_bp.route('/api/admin/ward-analytics', methods=['GET'])
    @jwt_required()
    def get_ward_analytics():
        """Get comprehensive ward analytics for Ward 1"""
        try:
            admin_check = require_admin()
            if admin_check:
                return admin_check
            
            # Define Ward 1 as the focus
            ward_name = "Ward 1"
            
            # === USER STATISTICS ===
            total_users = collections['users'].count_documents({'userType': 'user'})
            maternal_users = collections['users'].count_documents({
                'userType': 'user',
                'beneficiaryCategory': 'maternity'
            })
            palliative_users = collections['users'].count_documents({
                'userType': 'user',
                'beneficiaryCategory': 'palliative'
            })
            active_users = collections['users'].count_documents({
                'userType': 'user',
                'isActive': True
            })
            
            # === SUPPLY REQUEST STATISTICS ===
            total_supply_requests = collections['supply_requests'].count_documents({})
            pending_supplies = collections['supply_requests'].count_documents({'status': 'pending'})
            approved_supplies = collections['supply_requests'].count_documents({'status': 'approved'})
            rejected_supplies = collections['supply_requests'].count_documents({'status': 'rejected'})
            delivered_supplies = collections['supply_requests'].count_documents({'deliveryStatus': 'delivered'})
            
            # Supply requests by category
            supply_by_category = list(collections['supply_requests'].aggregate([
                {
                    '$group': {
                        '_id': '$category',
                        'count': {'$sum': 1}
                    }
                }
            ]))
            
            # === VACCINATION STATISTICS ===
            total_vaccinations = collections['vaccination_schedules'].count_documents({})
            total_bookings = collections['vaccination_bookings'].count_documents({})
            completed_vaccinations = collections['vaccination_bookings'].count_documents({'status': 'Completed'})
            
            # === HOME VISITS STATISTICS ===
            total_home_visits = collections['home_visits'].count_documents({})
            verified_visits = collections['home_visits'].count_documents({'verified': True})
            pending_verification = collections['home_visits'].count_documents({'verified': False})
            
            # Home visits by category
            maternal_visits = collections['home_visits'].count_documents({})  # Would need userCategory field
            palliative_visits = collections['home_visits'].count_documents({})
            
            # === MONTHLY RATION STATISTICS ===
            collected_rations = collections['monthly_rations'].count_documents({'status': 'collected'})
            pending_rations = collections['monthly_rations'].count_documents({'status': 'pending'})
            
            # === LOCATION STATISTICS ===
            locations = list(collections['locations'].find({'ward': ward_name}))
            location_stats = {
                'anganwadi': 0,
                'community_hall': 0,
                'health_center': 0,
                'other': 0
            }
            for loc in locations:
                loc_type = loc.get('type', 'other')
                if loc_type in location_stats:
                    location_stats[loc_type] += 1
                else:
                    location_stats['other'] += 1
            
            # === ACTIVITY HEAT MAP DATA ===
            # Get activity by month for the last 6 months
            six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
            
            # Supply requests over time
            supply_timeline = list(collections['supply_requests'].aggregate([
                {
                    '$match': {
                        'createdAt': {'$gte': six_months_ago}
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'year': {'$year': '$createdAt'},
                            'month': {'$month': '$createdAt'}
                        },
                        'count': {'$sum': 1}
                    }
                },
                {'$sort': {'_id.year': 1, '_id.month': 1}}
            ]))
            
            # Home visits over time
            visits_timeline = list(collections['home_visits'].aggregate([
                {
                    '$match': {
                        'visitDate': {'$gte': six_months_ago}
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'year': {'$year': '$visitDate'},
                            'month': {'$month': '$visitDate'}
                        },
                        'count': {'$sum': 1}
                    }
                },
                {'$sort': {'_id.year': 1, '_id.month': 1}}
            ]))
            
            # User registrations over time
            user_timeline = list(collections['users'].aggregate([
                {
                    '$match': {
                        'userType': 'user',
                        'createdAt': {'$gte': six_months_ago}
                    }
                },
                {
                    '$group': {
                        '_id': {
                            'year': {'$year': '$createdAt'},
                            'month': {'$month': '$createdAt'}
                        },
                        'count': {'$sum': 1}
                    }
                },
                {'$sort': {'_id.year': 1, '_id.month': 1}}
            ]))
            
            # === HEALTH BLOGS & COMMUNITY ENGAGEMENT ===
            total_blogs = collections['health_blogs'].count_documents({})
            published_blogs = collections['health_blogs'].count_documents({'status': 'published'})
            total_classes = collections['community_classes'].count_documents({})
            total_camps = collections['local_camps'].count_documents({})
            
            # === PREPARE RESPONSE ===
            analytics_data = {
                'ward': ward_name,
                'lastUpdated': datetime.now(timezone.utc).isoformat(),
                
                # User statistics
                'userStats': {
                    'total': int(total_users),
                    'maternal': int(maternal_users),
                    'palliative': int(palliative_users),
                    'active': int(active_users),
                    'distribution': {
                        'maternal': int(maternal_users),
                        'palliative': int(palliative_users)
                    }
                },
                
                # Supply statistics
                'supplyStats': {
                    'total': int(total_supply_requests),
                    'pending': int(pending_supplies),
                    'approved': int(approved_supplies),
                    'rejected': int(rejected_supplies),
                    'delivered': int(delivered_supplies),
                    'byCategory': [{'category': item['_id'] or 'Other', 'count': int(item['count'])} for item in supply_by_category]
                },
                
                # Vaccination statistics
                'vaccinationStats': {
                    'schedules': int(total_vaccinations),
                    'bookings': int(total_bookings),
                    'completed': int(completed_vaccinations)
                },
                
                # Home visits statistics
                'homeVisitStats': {
                    'total': int(total_home_visits),
                    'verified': int(verified_visits),
                    'pending': int(pending_verification)
                },
                
                # Monthly ration statistics
                'rationStats': {
                    'collected': int(collected_rations),
                    'pending': int(pending_rations)
                },
                
                # Location statistics
                'locationStats': {
                    'total': len(locations),
                    'byType': location_stats
                },
                
                # Content statistics
                'contentStats': {
                    'blogs': int(total_blogs),
                    'publishedBlogs': int(published_blogs),
                    'classes': int(total_classes),
                    'camps': int(total_camps)
                },
                
                # Activity timelines for charts
                'activityTimeline': {
                    'supplyRequests': [{'month': f"{item['_id']['year']}-{item['_id']['month']:02d}", 'count': int(item['count'])} for item in supply_timeline],
                    'homeVisits': [{'month': f"{item['_id']['year']}-{item['_id']['month']:02d}", 'count': int(item['count'])} for item in visits_timeline],
                    'userRegistrations': [{'month': f"{item['_id']['year']}-{item['_id']['month']:02d}", 'count': int(item['count'])} for item in user_timeline]
                },
                
                # Heat map intensity data (0-100 scale)
                'heatMapData': {
                    'userEngagement': min(100, int((active_users / max(total_users, 1)) * 100)),
                    'supplyActivity': min(100, int((total_supply_requests / max(1, 1)) * 20)),  # Scale appropriately
                    'vaccinationCoverage': min(100, int((completed_vaccinations / max(total_bookings, 1)) * 100)),
                    'homeVisitCoverage': min(100, int((verified_visits / max(total_home_visits, 1)) * 100)),
                    'rationCollection': min(100, int((collected_rations / max(collected_rations + pending_rations, 1)) * 100))
                }
            }
            
            return jsonify(analytics_data), 200
            
        except Exception as e:
            print(f"Error fetching ward analytics: {str(e)}")
            return jsonify({'error': f'Failed to fetch ward analytics: {str(e)}'}), 500
    
    # Register blueprint with app
    app.register_blueprint(ward_analytics_bp)
