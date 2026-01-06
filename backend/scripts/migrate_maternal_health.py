"""
Migration script to add maternalHealth field to existing maternity users.
Marks all existing maternity users as "delivered" since they likely already have children.
New registrations from now on will start as "pregnant" after profile completion.
"""

from config.database import get_database
from datetime import datetime, timezone

def migrate_maternal_health():
    """Add maternalHealth field to all existing maternity users"""
    
    db = get_database()
    users = db.users
    
    print("Starting maternal health migration...")
    print("-" * 50)
    
    # Count existing maternity users without maternalHealth
    maternity_users = users.count_documents({
        'beneficiaryCategory': 'maternity',
        'maternalHealth': {'$exists': False}
    })
    
    print(f"Found {maternity_users} maternity users to migrate")
    
    if maternity_users == 0:
        print("No users to migrate. All users already have maternalHealth field.")
        return
    
    # Confirm migration
    confirm = input(f"\nThis will mark {maternity_users} existing mothers as 'delivered'. Continue? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Migration cancelled.")
        return
    
    # Update all existing maternity users
    result = users.update_many(
        {
            'beneficiaryCategory': 'maternity',
            'maternalHealth': {'$exists': False}
        },
        {
            '$set': {
                'maternalHealth': {
                    'pregnancyStatus': 'delivered',
                    'lmp': None,  # Unknown for existing users
                    'edd': None,  # Unknown for existing users
                    'deliveryDate': None,  # Can be added later by ASHA worker
                    'deliveryDetails': None,
                    'children': []  # Can be linked later if needed
                },
                'updatedAt': datetime.now(timezone.utc)
            }
        }
    )
    
    print("-" * 50)
    print(f"*** Migration complete!")
    print(f"*** Updated {result.modified_count} maternity users")
    print(f"*** All marked as 'delivered' with vaccination features enabled")
    print("-" * 50)
    
    # Show summary
    total_delivered = users.count_documents({
        'beneficiaryCategory': 'maternity',
        'maternalHealth.pregnancyStatus': 'delivered'
    })
    
    total_pregnant = users.count_documents({
        'beneficiaryCategory': 'maternity',
        'maternalHealth.pregnancyStatus': 'pregnant'
    })
    
    print("\n*** Current Status Summary:")
    print(f"   - Delivered: {total_delivered}")
    print(f"   - Pregnant: {total_pregnant}")
    print(f"   - Total Maternity: {total_delivered + total_pregnant}")
    

def rollback_migration():
    """Rollback migration (remove maternalHealth field)"""
    
    db = get_database()
    users = db.users
    
    print("*** ROLLBACK: Removing maternalHealth field...")
    
    confirm = input("Are you sure you want to rollback? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Rollback cancelled.")
        return
    
    result = users.update_many(
        {'beneficiaryCategory': 'maternity'},
        {
            '$unset': {'maternalHealth': ''},
            '$set': {'updatedAt': datetime.now(timezone.utc)}
        }
    )
    
    print(f"*** Rollback complete! Removed maternalHealth from {result.modified_count} users")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--rollback':
        rollback_migration()
    else:
        migrate_maternal_health()
