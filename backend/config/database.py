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
        'weekly_rations': db.weekly_rations,
        'locations': db.locations,
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

        # Weekly rations: by userId, weekStartDate, status
        collections['weekly_rations'].create_index([('userId', 1), ('weekStartDate', -1)])
        collections['weekly_rations'].create_index([('weekStartDate', 1), ('status', 1)])
        collections['weekly_rations'].create_index([('status', 1), ('weekStartDate', -1)])

        # Locations: by ward and type for filtering
        collections['locations'].create_index([('ward', 1), ('type', 1)])
        collections['locations'].create_index([('name', 1)])

        print("Indexes ensured: users(email unique, phone partial unique), asha_feedback(userId+createdAt), calendar_events(start,end,createdBy), health_blogs(createdBy+createdAt, category+status, status+createdAt), vaccination_schedules(date,createdBy+date), vaccination_bookings(scheduleId,userId+createdAt), palliative_records(userId+date, testType), visit_requests(userId+createdAt, status+createdAt, requestType+status), supply_requests(userId+createdAt, status+createdAt, category+status), community_classes(date,createdBy+date,status+date), local_camps(date,createdBy+date,status+date), weekly_rations(userId+weekStartDate, weekStartDate+status, status+weekStartDate), locations(ward+type, name)")
    except Exception as e:
        print(f'Warning: could not ensure indexes: {e}')
