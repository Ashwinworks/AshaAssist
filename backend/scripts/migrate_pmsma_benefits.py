"""
Migration script to initialize PMSMA benefits for existing pregnant users
"""
from config.database import get_database
from datetime import datetime, timezone, timedelta
from bson import ObjectId


def migrate_pmsma_benefits():
    """Initialize PMSMA benefits for all existing pregnant users"""
    
    db = get_database()
    users = db.users
    visits = db.visits
    
    print("Starting PMSMA benefits migration...")
    print("-" * 50)
    
    # Find all pregnant users without PMSMA benefits
    pregnant_users = list(users.find({
        'beneficiaryCategory': 'maternity',
        'maternalHealth.pregnancyStatus': 'pregnant',
        '$or': [
            {'governmentBenefits.pmsma': {'$exists': False}},
            {'governmentBenefits': {'$exists': False}}
        ]
    }))
    
    print(f"Found {len(pregnant_users)} pregnant users without PMSMA benefits")
    
    if len(pregnant_users) == 0:
        print("No users to migrate. All users already have PMSMA benefits or are not pregnant.")
        return
    
    # Confirm migration
    confirm = input(f"\nThis will initialize PMSMA benefits for {len(pregnant_users)} pregnant users. Continue? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Migration cancelled.")
        return
    
    migrated_count = 0
    
    for user in pregnant_users:
        try:
            user_id = user['_id']
            maternal_health = user.get('maternalHealth', {})
            lmp = maternal_health.get('lmp')
            
            # Use LMP or creation date for confirmation date
            confirmation_date = None
            if lmp:
                confirmation_date = lmp
            elif user.get('createdAt'):
                confirmation_date = user['createdAt'].date().isoformat() if isinstance(user['createdAt'], datetime) else str(user['createdAt'])[:10]
            else:
                confirmation_date = datetime.now(timezone.utc).date().isoformat()
            
            # Check eligibility for installment 1 (within 3 months of LMP)
            installment1_eligible = False
            if lmp and confirmation_date:
                try:
                    lmp_date = datetime.strptime(lmp, '%Y-%m-%d') if isinstance(lmp, str) else lmp
                    conf_date = datetime.strptime(confirmation_date, '%Y-%m-%d') if isinstance(confirmation_date, str) else confirmation_date
                    days_since_lmp = (conf_date - lmp_date).days
                    installment1_eligible = 0 <= days_since_lmp <= 84
                except Exception:
                    installment1_eligible = False
            
            # Check if user has ANC visits for installment 2
            visit_count = visits.count_documents({'userId': user_id})
            installment2_eligible = visit_count > 0
            
            # Create PMSMA structure
            pmsma_data = {
                'installments': [
                    {
                        'installmentNumber': 1,
                        'amount': 1000,
                        'eligibilityDate': confirmation_date if installment1_eligible else None,
                        'status': 'eligible' if installment1_eligible else 'locked',
                        'paidDate': None,
                        'transactionId': None,
                        'eligibilityCriteria': 'pregnancy_registration_within_3_months',
                        'description': 'First installment for early pregnancy registration'
                    },
                    {
                        'installmentNumber': 2,
                        'amount': 2000,
                        'eligibilityDate': datetime.now(timezone.utc).isoformat() if installment2_eligible else None,
                        'status': 'eligible' if installment2_eligible else 'locked',
                        'paidDate': None,
                        'transactionId': None,
                        'eligibilityCriteria': 'anc_visit_recorded',
                        'description': 'Second installment after first ANC visit'
                    },
                    {
                        'installmentNumber': 3,
                        'amount': 2000,
                        'eligibilityDate': None,
                        'status': 'locked',
                        'paidDate': None,
                        'transactionId': None,
                        'eligibilityCriteria': 'birth_recorded',
                        'description': 'Third installment after birth registration'
                    }
                ],
                'totalAmount': 5000,
                'totalEligible': (1000 if installment1_eligible else 0) + (2000 if installment2_eligible else 0),
                'totalPaid': 0,
                'progress': f"{(1 if installment1_eligible else 0) + (1 if installment2_eligible else 0)}/3",
                'programName': 'Pradhan Mantri Surakshit Matritva Abhiyan',
                'programShortName': 'PMSMA',
                'createdAt': datetime.now(timezone.utc)
            }
            
            # Update user document
            result = users.update_one(
                {'_id': user_id},
                {
                    '$set': {
                        'governmentBenefits.pmsma': pmsma_data,
                        'updatedAt': datetime.now(timezone.utc)
                    }
                }
            )
            
            if result.matched_count > 0:
                migrated_count += 1
                print(f"✓ Migrated user: {user.get('name')} (Installments unlocked: {pmsma_data['progress']})")
        
        except Exception as e:
            print(f"✗ Failed to migrate user {user.get('name')}: {str(e)}")
    
    print("-" * 50)
    print(f"*** Migration complete!***")
    print(f"*** Successfully migrated {migrated_count} out of {len(pregnant_users)} users")
    print("-" * 50)


def rollback_migration():
    """Rollback migration (remove PMSMA benefits)"""
    
    db = get_database()
    users = db.users
    
    print("*** ROLLBACK: Removing PMSMA benefits...")
    
    confirm = input("Are you sure you want to rollback? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Rollback cancelled.")
        return
    
    result = users.update_many(
        {'beneficiaryCategory': 'maternity'},
        {
            '$unset': {'governmentBenefits.pmsma': ''},
            '$set': {'updatedAt': datetime.now(timezone.utc)}
        }
    )
    
    print(f"*** Rollback complete! Removed PMSMA from {result.modified_count} users")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--rollback':
        rollback_migration()
    else:
        migrate_pmsma_benefits()
