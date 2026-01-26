"""
Database configuration and connection setup
"""
import os
from pymongo import MongoClient
from config.settings import Config

def get_database():
    """Get database connection"""
    try:
        client = MongoClient(Config.MONGODB_URI)
        db = client[Config.DATABASE_NAME]
        print("Connected to MongoDB successfully!")
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise

def get_collections(db):
    """Get all collection references"""
    return {
        'users': db.users,
        'visits': db.visits,
        'asha_feedback': db.asha_feedback,
        'calendar_events': db.calendar_events,
        'health_blogs': db.health_blogs,
        'vaccination_schedules': db.vaccination_schedules,
        'vaccination_bookings': db.vaccination_bookings,
        'palliative_records': db.palliative_records,
        'visit_requests': db.visit_requests,
        'supply_requests': db.supply_requests,
        'community_classes': db.community_classes,
        'local_camps': db.local_camps,
        'monthly_rations': db.monthly_rations,
        'locations': db.locations,
        'home_visits': db.home_visits,
        'developmental_milestones': db.developmental_milestones,
        'milestone_records': db.milestone_records,
        'maternity_profiles': db.maternity_profiles,
        'notifications': db.notifications,
    }

def ensure_indexes(collections):
    """Create database indexes for optimal performance"""
    try:
        # Users: unique email and partial unique phone
        collections['users'].create_index([('email', 1)], unique=True)
        indexes = collections['users'].index_information()
        if 'phone_1' in indexes:
            collections['users'].drop_index('phone_1')
        collections['users'].create_index(
            [('phone', 1)],
            unique=True,
            partialFilterExpression={'phone': {'$exists': True, '$type': 'string'}}
        )
        
        # ASHA feedback: index by user and createdAt for listing
        collections['asha_feedback'].create_index([('userId', 1), ('createdAt', -1)])

        # Calendar events: by start/end for range queries, and createdBy
        collections['calendar_events'].create_index([('start', 1)])
        collections['calendar_events'].create_index([('end', 1)])
        collections['calendar_events'].create_index([('createdBy', 1)])

        # Health blogs: indexes for author, category, createdAt, status
        collections['health_blogs'].create_index([('createdBy', 1), ('createdAt', -1)])
        collections['health_blogs'].create_index([('category', 1), ('status', 1)])
        collections['health_blogs'].create_index([('status', 1), ('createdAt', -1)])

        # Vaccination schedules & bookings
        collections['vaccination_schedules'].create_index([('date', 1)])
        collections['vaccination_schedules'].create_index([('createdBy', 1), ('date', -1)])
        collections['vaccination_bookings'].create_index([('scheduleId', 1)])
        collections['vaccination_bookings'].create_index([('userId', 1), ('createdAt', -1)])

        # Palliative records: by user and date for timeline/listing; testType for filtering
        collections['palliative_records'].create_index([('userId', 1), ('date', -1)])
        collections['palliative_records'].create_index([('testType', 1)])

        # Visit requests: by user, status, and createdAt for filtering and listing
        collections['visit_requests'].create_index([('userId', 1), ('createdAt', -1)])
        collections['visit_requests'].create_index([('status', 1), ('createdAt', -1)])
        collections['visit_requests'].create_index([('requestType', 1), ('status', 1)])

        # Community classes: by date, createdBy, status
        collections['community_classes'].create_index([('date', 1)])
        collections['community_classes'].create_index([('createdBy', 1), ('date', -1)])
        collections['community_classes'].create_index([('status', 1), ('date', -1)])

        # Supply requests: by user, status, category, createdAt
        collections['supply_requests'].create_index([('userId', 1), ('createdAt', -1)])
        collections['supply_requests'].create_index([('status', 1), ('createdAt', -1)])
        collections['supply_requests'].create_index([('category', 1), ('status', 1)])

        # Local camps: by date, createdBy, status
        collections['local_camps'].create_index([('date', 1)])
        collections['local_camps'].create_index([('createdBy', 1), ('date', -1)])
        collections['local_camps'].create_index([('status', 1), ('date', -1)])

        # Monthly rations: by userId, monthStartDate, status
        collections['monthly_rations'].create_index([('userId', 1), ('monthStartDate', -1)])
        collections['monthly_rations'].create_index([('monthStartDate', 1), ('status', 1)])
        collections['monthly_rations'].create_index([('status', 1), ('monthStartDate', -1)])

        # Locations: by ward and type for filtering
        collections['locations'].create_index([('ward', 1), ('type', 1)])
        collections['locations'].create_index([('name', 1)])

        # Home visits: by userId, ashaWorkerId, visitDate, verified status
        collections['home_visits'].create_index([('userId', 1), ('visitDate', -1)])
        collections['home_visits'].create_index([('ashaWorkerId', 1), ('visitDate', -1)])
        collections['home_visits'].create_index([('visitDate', -1)])
        collections['home_visits'].create_index([('verified', 1), ('visitDate', -1)])

        # Milestone records: by userId, milestoneId, achievedDate
        collections['milestone_records'].create_index([('userId', 1), ('achievedDate', -1)])
        collections['milestone_records'].create_index([('userId', 1), ('milestoneId', 1)])
        collections['milestone_records'].create_index([('status', 1)])

        # Developmental milestones: by order for display
        collections['developmental_milestones'].create_index([('order', 1)])
        collections['developmental_milestones'].create_index([('isActive', 1)])

        # Notifications: by recipientId, recipientType, isRead status and createdAt for user queries
        collections['notifications'].create_index([('recipientId', 1), ('createdAt', -1)])
        collections['notifications'].create_index([('recipientType', 1), ('createdAt', -1)])
        collections['notifications'].create_index([('recipientId', 1), ('isRead', 1), ('createdAt', -1)])

        print("Indexes ensured: users(email unique, phone partial unique), asha_feedback(userId+createdAt), calendar_events(start,end,createdBy), health_blogs(createdBy+createdAt, category+status, status+createdAt), vaccination_schedules(date,createdBy+date), vaccination_bookings(scheduleId,userId+createdAt), palliative_records(userId+date, testType), visit_requests(userId+createdAt, status+createdAt, requestType+status), supply_requests(userId+createdAt, status+createdAt, category+status), community_classes(date,createdBy+date,status+date), local_camps(date,createdBy+date,status+date), monthly_rations(userId+monthStartDate, monthStartDate+status, status+monthStartDate), locations(ward+type, name), home_visits(userId+visitDate, ashaWorkerId+visitDate, visitDate, verified+visitDate), milestone_records(userId+achievedDate, userId+milestoneId, status), developmental_milestones(order, isActive)")
    except Exception as e:
        print(f'Warning: could not ensure indexes: {e}')
