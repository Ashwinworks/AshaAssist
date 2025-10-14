"""
Seed developmental milestones into the database
"""
from config.database import get_database, get_collections
from datetime import datetime, timezone
from bson import ObjectId

def seed_milestones():
    print("Connecting to database...")
    db = get_database()
    collections = get_collections(db)
    
    # Check if milestones already exist
    existing_count = collections['developmental_milestones'].count_documents({})
    if existing_count > 0:
        print(f"✓ Milestones already seeded ({existing_count} milestones found)")
        return
    
    print("Seeding developmental milestones...")
    
    milestones = [
        {
            'milestoneName': 'Social Smile',
            'description': 'Baby smiles in response to your smile or voice',
            'minMonths': 1,
            'maxMonths': 3,
            'order': 1,
            'icon': '😊',
            'category': 'social',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        },
        {
            'milestoneName': 'Head Control',
            'description': 'Baby can hold head steady when supported in sitting position',
            'minMonths': 2,
            'maxMonths': 4,
            'order': 2,
            'icon': '👶',
            'category': 'motor',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        },
        {
            'milestoneName': 'Rolling Over',
            'description': 'Baby can roll from tummy to back and back to tummy',
            'minMonths': 4,
            'maxMonths': 6,
            'order': 3,
            'icon': '🔄',
            'category': 'motor',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        },
        {
            'milestoneName': 'Sitting with Support',
            'description': 'Baby can sit with support and hold head steady',
            'minMonths': 4,
            'maxMonths': 6,
            'order': 4,
            'icon': '🪑',
            'category': 'motor',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        },
        {
            'milestoneName': 'Sitting Without Support',
            'description': 'Baby can sit without support for several minutes',
            'minMonths': 6,
            'maxMonths': 8,
            'order': 5,
            'icon': '🧸',
            'category': 'motor',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        },
        {
            'milestoneName': 'Crawling',
            'description': 'Baby can move around by crawling on hands and knees',
            'minMonths': 7,
            'maxMonths': 10,
            'order': 6,
            'icon': '🐛',
            'category': 'motor',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        },
        {
            'milestoneName': 'Standing with Support',
            'description': 'Baby can pull to stand and stand while holding on',
            'minMonths': 8,
            'maxMonths': 10,
            'order': 7,
            'icon': '🧍',
            'category': 'motor',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        },
        {
            'milestoneName': 'First Words',
            'description': 'Baby says first meaningful words like "mama" or "dada"',
            'minMonths': 10,
            'maxMonths': 14,
            'order': 8,
            'icon': '💬',
            'category': 'language',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        },
        {
            'milestoneName': 'Walking Independently',
            'description': 'Baby can walk several steps without support',
            'minMonths': 12,
            'maxMonths': 18,
            'order': 9,
            'icon': '🚶',
            'category': 'motor',
            'isActive': True,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        }
    ]
    
    result = collections['developmental_milestones'].insert_many(milestones)
    print(f"✓ Successfully seeded {len(result.inserted_ids)} developmental milestones!")
    
    # Create indexes
    collections['developmental_milestones'].create_index('order')
    collections['developmental_milestones'].create_index('isActive')
    print("✓ Indexes created")

if __name__ == '__main__':
    seed_milestones()
    print("\n✅ Done! Milestones are ready to use.")
