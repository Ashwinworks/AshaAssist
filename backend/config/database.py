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
        
        print("Indexes ensured: users(email unique, phone partial unique), asha_feedback(userId+createdAt), calendar_events(start,end,createdBy), health_blogs(createdBy+createdAt, category+status, status+createdAt), vaccination_schedules(date,createdBy+date), vaccination_bookings(scheduleId,userId+createdAt), palliative_records(userId+date, testType)")
    except Exception as e:
        print(f'Warning: could not ensure indexes: {e}')
