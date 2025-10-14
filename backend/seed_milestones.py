"""
One-time script to seed developmental milestones
Run this after starting the backend server
"""
from config.database import get_database, get_collections
from services.milestone_service import MilestoneService

def seed_milestones():
    """Seed the developmental milestones"""
    print("Connecting to database...")
    db = get_database()
    collections = get_collections(db)
    
    print("Initializing milestone service...")
    milestone_service = MilestoneService(
        collections['users'],
        collections['developmental_milestones'],
        collections['milestone_records']
    )
    
    print("Seeding milestones...")
    result, status = milestone_service.seed_milestones()
    
    if status == 200 or status == 201:
        print(f"✓ Success: {result.get('message')}")
    else:
        print(f"✗ Error: {result.get('error')}")

if __name__ == '__main__':
    seed_milestones()
