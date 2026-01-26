"""
MilestoneService: business logic for developmental milestone tracking
"""
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, List
from bson import ObjectId


class MilestoneService:
    def __init__(self, users_collection, developmental_milestones_collection, milestone_records_collection):
        self.users = users_collection
        self.developmental_milestones = developmental_milestones_collection
        self.milestone_records = milestone_records_collection

    def get_all_milestones(self) -> Tuple[Dict[str, Any], int]:
        """Get all developmental milestones"""
        try:
            milestones = list(self.developmental_milestones.find(
                {'isActive': True}
            ).sort('order', 1))
            
            result = []
            for milestone in milestones:
                result.append({
                    'id': str(milestone['_id']),
                    'milestoneName': milestone.get('milestoneName'),
                    'description': milestone.get('description'),
                    'minMonths': milestone.get('minMonths'),
                    'maxMonths': milestone.get('maxMonths'),
                    'order': milestone.get('order'),
                    'icon': milestone.get('icon', '🎯'),
                    'checklistItems': milestone.get('checklistItems', []),
                    'videoUrl': milestone.get('videoUrl'),
                    'tips': milestone.get('tips', []),
                    'safetyWarnings': milestone.get('safetyWarnings', []),
                    'whatToExpect': milestone.get('whatToExpect'),
                    'redFlags': milestone.get('redFlags', [])
                })
            
            return {'milestones': result}, 200
        except Exception as e:
            return {'error': f'Failed to fetch milestones: {str(e)}'}, 500

    def get_user_milestones(self, user_id: str) -> Tuple[Dict[str, Any], int]:
        """Get all milestones with user's achievement status"""
        try:
            # Get all milestones
            milestones = list(self.developmental_milestones.find(
                {'isActive': True}
            ).sort('order', 1))
            
            # Get user's milestone records
            user_records = list(self.milestone_records.find({
                'userId': ObjectId(user_id)
            }))
            
            # Create a map of milestone_id -> record
            records_map = {str(record['milestoneId']): record for record in user_records}
            
            # Get user info for age calculation
            user = self.users.find_one({'_id': ObjectId(user_id)})
            child_dob = user.get('childDOB') if user else None
            child_age_months = None
            
            if child_dob:
                if isinstance(child_dob, str):
                    dob_date = datetime.fromisoformat(child_dob.replace('Z', '+00:00'))
                else:
                    dob_date = child_dob
                age_days = (datetime.now(timezone.utc) - dob_date).days
                child_age_months = age_days / 30.44  # Average days per month
            
            result = []
            for milestone in milestones:
                milestone_id = str(milestone['_id'])
                record = records_map.get(milestone_id)
                
                milestone_data = {
                    'id': milestone_id,
                    'milestoneName': milestone.get('milestoneName'),
                    'description': milestone.get('description'),
                    'minMonths': milestone.get('minMonths'),
                    'maxMonths': milestone.get('maxMonths'),
                    'order': milestone.get('order'),
                    'icon': milestone.get('icon', '🎯'),
                    'checklistItems': milestone.get('checklistItems', []),
                    'videoUrl': milestone.get('videoUrl'),
                    'tips': milestone.get('tips', []),
                    'safetyWarnings': milestone.get('safetyWarnings', []),
                    'whatToExpect': milestone.get('whatToExpect'),
                    'redFlags': milestone.get('redFlags', []),
                    'achieved': False,
                    'achievedDate': None,
                    'childAgeInMonths': None,
                    'notes': None,
                    'photoUrl': None,
                    'recordId': None
                }
                
                if record:
                    milestone_data.update({
                        'achieved': record.get('status') == 'achieved',
                        'achievedDate': record.get('achievedDate'),
                        'childAgeInMonths': record.get('childAgeInMonths'),
                        'notes': record.get('notes'),
                        'photoUrl': record.get('photoUrl'),
                        'recordId': str(record['_id'])
                    })
                
                # Add status indicator
                if milestone_data['achieved']:
                    milestone_data['statusText'] = 'Achieved'
                    milestone_data['statusColor'] = 'green'
                elif child_age_months and child_age_months > milestone.get('maxMonths', 999):
                    milestone_data['statusText'] = 'Overdue'
                    milestone_data['statusColor'] = 'red'
                elif child_age_months and child_age_months >= milestone.get('minMonths', 0):
                    milestone_data['statusText'] = 'Due Now'
                    milestone_data['statusColor'] = 'yellow'
                else:
                    milestone_data['statusText'] = 'Upcoming'
                    milestone_data['statusColor'] = 'blue'
                
                result.append(milestone_data)
            
            return {
                'milestones': result,
                'childAgeMonths': child_age_months
            }, 200
        except Exception as e:
            return {'error': f'Failed to fetch user milestones: {str(e)}'}, 500

    def record_milestone(self, user_id: str, milestone_id: str, achieved_date: str, 
                        notes: str = None, photo_url: str = None) -> Tuple[Dict[str, Any], int]:
        """Record a milestone achievement"""
        try:
            # Check if milestone exists
            milestone = self.developmental_milestones.find_one({'_id': ObjectId(milestone_id)})
            if not milestone:
                return {'error': 'Milestone not found'}, 404
            
            # Check if already recorded
            existing = self.milestone_records.find_one({
                'userId': ObjectId(user_id),
                'milestoneId': ObjectId(milestone_id)
            })
            
            if existing:
                return {'error': 'Milestone already recorded'}, 400
            
            # Get user info for age calculation
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404
            
            child_dob = user.get('childDOB')
            child_age_months = None
            child_age_days = None
            
            # Calculate age if DOB is available
            if child_dob:
                try:
                    if isinstance(child_dob, str):
                        dob_date = datetime.fromisoformat(child_dob.replace('Z', '+00:00'))
                    else:
                        dob_date = child_dob
                    
                    # Parse achieved_date - handle both date string and datetime
                    if isinstance(achieved_date, str):
                        # Handle date-only format (YYYY-MM-DD)
                        if 'T' not in achieved_date:
                            achieved_date_obj = datetime.strptime(achieved_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                        else:
                            achieved_date_obj = datetime.fromisoformat(achieved_date.replace('Z', '+00:00'))
                    else:
                        achieved_date_obj = achieved_date
                    
                    child_age_days = (achieved_date_obj - dob_date).days
                    child_age_months = child_age_days / 30.44
                except Exception as date_error:
                    print(f"Warning: Could not calculate age: {date_error}")
                    # Continue without age calculation
            
            # Create milestone record
            record = {
                'userId': ObjectId(user_id),
                'milestoneId': ObjectId(milestone_id),
                'milestoneName': milestone.get('milestoneName'),
                'achievedDate': achieved_date,
                'childAgeInMonths': child_age_months,
                'childAgeInDays': child_age_days,
                'notes': notes,
                'photoUrl': photo_url,
                'status': 'achieved',
                'verificationStatus': 'pending',  # pending, approved, flagged
                'verifiedBy': None,
                'verificationNotes': None,
                'verificationDate': None,
                'recordedBy': ObjectId(user_id),
                'recordedByType': 'parent',
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc)
            }
            
            result = self.milestone_records.insert_one(record)
            
            return {
                'message': 'Milestone recorded successfully',
                'recordId': str(result.inserted_id)
            }, 201
        except Exception as e:
            return {'error': f'Failed to record milestone: {str(e)}'}, 500

    def update_milestone_record(self, user_id: str, record_id: str, achieved_date: str = None,
                               notes: str = None, photo_url: str = None) -> Tuple[Dict[str, Any], int]:
        """Update a milestone record"""
        try:
            # Find the record
            record = self.milestone_records.find_one({
                '_id': ObjectId(record_id),
                'userId': ObjectId(user_id)
            })
            
            if not record:
                return {'error': 'Milestone record not found'}, 404
            
            # Prepare update data
            update_data = {
                'updatedAt': datetime.now(timezone.utc)
            }
            
            if notes is not None:
                update_data['notes'] = notes
            
            if photo_url is not None:
                update_data['photoUrl'] = photo_url
            
            if achieved_date is not None:
                update_data['achievedDate'] = achieved_date
                
                # Recalculate age if date changed
                user = self.users.find_one({'_id': ObjectId(user_id)})
                child_dob = user.get('childDOB')
                
                if child_dob:
                    try:
                        if isinstance(child_dob, str):
                            dob_date = datetime.fromisoformat(child_dob.replace('Z', '+00:00'))
                        else:
                            dob_date = child_dob
                        
                        if isinstance(achieved_date, str):
                            # Handle date-only format (YYYY-MM-DD)
                            if 'T' not in achieved_date:
                                achieved_date_obj = datetime.strptime(achieved_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                            else:
                                achieved_date_obj = datetime.fromisoformat(achieved_date.replace('Z', '+00:00'))
                        else:
                            achieved_date_obj = achieved_date
                        
                        child_age_days = (achieved_date_obj - dob_date).days
                        child_age_months = child_age_days / 30.44
                        
                        update_data['childAgeInMonths'] = child_age_months
                        update_data['childAgeInDays'] = child_age_days
                    except Exception as date_error:
                        print(f"Warning: Could not recalculate age: {date_error}")
            
            # Update the record
            self.milestone_records.update_one(
                {'_id': ObjectId(record_id)},
                {'$set': update_data}
            )
            
            return {'message': 'Milestone record updated successfully'}, 200
        except Exception as e:
            return {'error': f'Failed to update milestone record: {str(e)}'}, 500

    def delete_milestone_record(self, user_id: str, record_id: str) -> Tuple[Dict[str, Any], int]:
        """Delete a milestone record"""
        try:
            result = self.milestone_records.delete_one({
                '_id': ObjectId(record_id),
                'userId': ObjectId(user_id)
            })
            
            if result.deleted_count == 0:
                return {'error': 'Milestone record not found'}, 404
            
            return {'message': 'Milestone record deleted successfully'}, 200
        except Exception as e:
            return {'error': f'Failed to delete milestone record: {str(e)}'}, 500

    def get_maternal_users_milestones(self, asha_worker_id: str = None) -> Tuple[Dict[str, Any], int]:
        """Get all maternal users with their milestone progress (for ASHA workers)"""
        try:
            # Get all maternity users
            # For now, show all maternity users regardless of ASHA assignment
            query = {'beneficiaryCategory': 'maternity'}
            # TODO: Uncomment below to filter by assigned ASHA worker
            # if asha_worker_id:
            #     query['ashaWorkerId'] = ObjectId(asha_worker_id)
            
            users = list(self.users.find(query))
            
            result = []
            for user in users:
                user_id = str(user['_id'])
                
                # Get user's milestone records
                records = list(self.milestone_records.find({'userId': user['_id']}))
                
                # Get all milestones
                all_milestones = list(self.developmental_milestones.find({'isActive': True}))
                
                # Calculate statistics
                total_milestones = len(all_milestones)
                achieved_count = len(records)
                pending_verification = len([r for r in records if r.get('verificationStatus') == 'pending'])
                approved_count = len([r for r in records if r.get('verificationStatus') == 'approved'])
                flagged_count = len([r for r in records if r.get('verificationStatus') == 'flagged'])
                
                # Calculate overdue milestones
                child_dob = user.get('childDOB')
                overdue_count = 0
                if child_dob:
                    if isinstance(child_dob, str):
                        dob_date = datetime.fromisoformat(child_dob.replace('Z', '+00:00'))
                    else:
                        dob_date = child_dob
                    child_age_months = (datetime.now(timezone.utc) - dob_date).days / 30.44
                    
                    # Count overdue milestones
                    recorded_milestone_ids = [str(r['milestoneId']) for r in records]
                    for milestone in all_milestones:
                        if str(milestone['_id']) not in recorded_milestone_ids:
                            if child_age_months > milestone.get('maxMonths', 999):
                                overdue_count += 1
                
                user_data = {
                    'userId': user_id,
                    'userName': user.get('name'),
                    'phone': user.get('phone'),
                    'childDOB': user.get('childDOB'),
                    'childAgeMonths': child_age_months if child_dob else None,
                    'totalMilestones': total_milestones,
                    'achievedCount': achieved_count,
                    'pendingVerification': pending_verification,
                    'approvedCount': approved_count,
                    'flaggedCount': flagged_count,
                    'overdueCount': overdue_count,
                    'lastRecordedDate': records[-1].get('createdAt') if records else None
                }
                result.append(user_data)
            
            # Sort by overdue count (descending) and pending verification
            result.sort(key=lambda x: (x['overdueCount'], x['pendingVerification']), reverse=True)
            
            return {'users': result}, 200
        except Exception as e:
            return {'error': f'Failed to fetch maternal users milestones: {str(e)}'}, 500

    def get_user_milestone_details(self, user_id: str) -> Tuple[Dict[str, Any], int]:
        """Get detailed milestone information for a specific user (for ASHA workers)"""
        try:
            # Get user info
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404
            
            # Get all milestones with user's records
            milestones = list(self.developmental_milestones.find({'isActive': True}).sort('order', 1))
            user_records = list(self.milestone_records.find({'userId': ObjectId(user_id)}))
            
            # Create a map of milestone_id -> record
            records_map = {str(record['milestoneId']): record for record in user_records}
            
            # Get child age
            child_dob = user.get('childDOB')
            child_age_months = None
            if child_dob:
                if isinstance(child_dob, str):
                    dob_date = datetime.fromisoformat(child_dob.replace('Z', '+00:00'))
                else:
                    dob_date = child_dob
                child_age_months = (datetime.now(timezone.utc) - dob_date).days / 30.44
            
            result = []
            for milestone in milestones:
                milestone_id = str(milestone['_id'])
                record = records_map.get(milestone_id)
                
                milestone_data = {
                    'id': milestone_id,
                    'milestoneName': milestone.get('milestoneName'),
                    'description': milestone.get('description'),
                    'minMonths': milestone.get('minMonths'),
                    'maxMonths': milestone.get('maxMonths'),
                    'order': milestone.get('order'),
                    'icon': milestone.get('icon'),
                    'checklistItems': milestone.get('checklistItems', []),
                    'videoUrl': milestone.get('videoUrl'),
                    'tips': milestone.get('tips', []),
                    'safetyWarnings': milestone.get('safetyWarnings', []),
                    'whatToExpect': milestone.get('whatToExpect'),
                    'redFlags': milestone.get('redFlags', []),
                    'achieved': record is not None,
                    'achievedDate': record.get('achievedDate') if record else None,
                    'childAgeInMonths': record.get('childAgeInMonths') if record else None,
                    'notes': record.get('notes') if record else None,
                    'photoUrl': record.get('photoUrl') if record else None,
                    'recordId': str(record['_id']) if record else None,
                    'verificationStatus': record.get('verificationStatus') if record else None,
                    'verifiedBy': str(record.get('verifiedBy')) if record and record.get('verifiedBy') else None,
                    'verificationNotes': record.get('verificationNotes') if record else None,
                    'verificationDate': record.get('verificationDate') if record else None,
                }
                
                # Determine status
                if record:
                    if record.get('verificationStatus') == 'approved':
                        milestone_data['statusText'] = 'Approved'
                        milestone_data['statusColor'] = 'green'
                    elif record.get('verificationStatus') == 'flagged':
                        milestone_data['statusText'] = 'Flagged'
                        milestone_data['statusColor'] = 'red'
                    else:
                        milestone_data['statusText'] = 'Pending Verification'
                        milestone_data['statusColor'] = 'yellow'
                elif child_age_months and child_age_months > milestone.get('maxMonths', 999):
                    milestone_data['statusText'] = 'Overdue - Not Recorded'
                    milestone_data['statusColor'] = 'red'
                elif child_age_months and child_age_months >= milestone.get('minMonths', 0):
                    milestone_data['statusText'] = 'Due Now'
                    milestone_data['statusColor'] = 'yellow'
                else:
                    milestone_data['statusText'] = 'Upcoming'
                    milestone_data['statusColor'] = 'blue'
                
                result.append(milestone_data)
            
            return {
                'user': {
                    'userId': user_id,
                    'userName': user.get('name'),
                    'phone': user.get('phone'),
                    'childDOB': user.get('childDOB'),
                    'childAgeMonths': child_age_months
                },
                'milestones': result
            }, 200
        except Exception as e:
            return {'error': f'Failed to fetch user milestone details: {str(e)}'}, 500

    def verify_milestone(self, record_id: str, asha_worker_id: str, 
                        verification_status: str, notes: str = None) -> Tuple[Dict[str, Any], int]:
        """Verify a milestone record (ASHA worker)"""
        try:
            if verification_status not in ['approved', 'flagged']:
                return {'error': 'Invalid verification status'}, 400
            
            record = self.milestone_records.find_one({'_id': ObjectId(record_id)})
            if not record:
                return {'error': 'Milestone record not found'}, 404
            
            update_data = {
                'verificationStatus': verification_status,
                'verifiedBy': ObjectId(asha_worker_id),
                'verificationNotes': notes,
                'verificationDate': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc)
            }
            
            self.milestone_records.update_one(
                {'_id': ObjectId(record_id)},
                {'$set': update_data}
            )
            
            return {'message': f'Milestone {verification_status} successfully'}, 200
        except Exception as e:
            return {'error': f'Failed to verify milestone: {str(e)}'}, 500

    def seed_milestones(self) -> Tuple[Dict[str, Any], int]:
        """Seed initial milestone data"""
        try:
            # Check if milestones already exist
            existing_count = self.developmental_milestones.count_documents({})
            if existing_count > 0:
                return {'message': 'Milestones already seeded'}, 200
            
            milestones = [
                {
                    'milestoneName': 'Holds head up',
                    'description': 'Baby can lift and hold their head up while on tummy',
                    'minMonths': 2,
                    'maxMonths': 4,
                    'order': 1,
                    'icon': '👶',
                    'checklistItems': [
                        'Lifts head 45 degrees during tummy time',
                        'Holds head steady when held upright',
                        'Turns head side to side while on back',
                        'Makes smooth movements with head'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/qGW0NbbGjsI',
                    'tips': [
                        'Practice tummy time for 3-5 minutes, 2-3 times daily',
                        'Place colorful toys at eye level to encourage head lifting',
                        'Talk to baby from different positions to encourage head turning',
                        'Support head and neck during the first few months',
                        'Start tummy time from day one for short periods'
                    ],
                    'safetyWarnings': [
                        'Always supervise during tummy time',
                        'Place baby on firm, flat surface - never on soft bedding',
                        'Never leave baby unattended on elevated surfaces',
                        'Support head when picking up or carrying baby'
                    ],
                    'whatToExpect': 'By 2-4 months, most babies develop enough neck strength to lift their head 45-90 degrees while on their tummy. You may notice your baby holding their head more steadily when you hold them upright. This milestone is crucial for developing upper body strength needed for later skills like sitting and crawling.',
                    'redFlags': [
                        'No head control by 4 months',
                        'Head always tilted to one side (possible torticollis)',
                        'Cannot lift head at all during tummy time by 3 months',
                        'Floppy head movements with no improvement'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Kamazhnu veezhal (Tummy to back rolling)',
                    'description': 'Baby can roll from tummy to back',
                    'minMonths': 4,
                    'maxMonths': 6,
                    'order': 2,
                    'icon': '🔄',
                    'checklistItems': [
                        'Rolls from tummy to back on their own',
                        'Uses arm strength to push and turn',
                        'Shows intention to move and explore',
                        'May roll back to tummy as well'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/8vDDvhJEt-k',
                    'tips': [
                        'Give plenty of supervised floor time for practice',
                        'Place interesting toys to one side to encourage rolling',
                        'Gently guide baby through rolling motion during play',
                        'Celebrate each rolling attempt to encourage the behavior',
                        'Remove pillows and soft items from play area'
                    ],
                    'safetyWarnings': [
                        'Never leave baby alone on changing table or bed - rolling can happen suddenly!',
                        'Keep one hand on baby during diaper changes',
                        'Ensure play area is safe with no hard edges nearby',
                        'Remove loose blankets and toys from sleep area',
                        'Once baby can roll, stop swaddling during sleep'
                    ],
                    'whatToExpect': 'Rolling from tummy to back usually happens before back to tummy (which comes around 5-7 months). Your baby might surprise you one day by suddenly flipping over! Some babies skip rolling altogether and move straight to sitting or crawling - this is normal. The key is that baby shows progressive motor development.',
                    'redFlags': [
                        'No rolling in either direction by 7 months',
                        'Only rolls to one side consistently (possible asymmetry)',
                        'Appears stiff or difficult to move limbs',
                        'No interest in moving or reaching for toys'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Sitting with support',
                    'description': 'Baby can sit upright with support from parent or cushions',
                    'minMonths': 4,
                    'maxMonths': 6,
                    'order': 3,
                    'icon': '🪑',
                    'checklistItems': [
                        'Sits with back support for several minutes',
                        'Holds head steady while sitting',
                        'Can lean forward slightly without falling',
                        'Shows interest in sitting position'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/TeSSWtkF4yo',
                    'tips': [
                        'Support baby in sitting position during playtime',
                        'Use cushions to create a supportive sitting area',
                        'Sit with baby between your legs for support',
                        'Keep sitting sessions short (5-10 minutes) initially',
                        'Place toys within reach to encourage sitting'
                    ],
                    'safetyWarnings': [
                        'Never use infant seats or bumbo seats for prolonged periods',
                        'Always stay within arm\'s reach when baby is sitting',
                        'Ensure soft landing area around baby',
                        'Don\'t force sitting before baby is ready',
                        'Avoid walkers - they can delay development and cause injuries'
                    ],
                    'whatToExpect': 'Sitting with support is an important step toward independent sitting. Your baby will first need head and neck control, then trunk strength. Initially, baby may wobble or topple over, which is completely normal. With practice, they will build the muscle strength needed for independent sitting.',
                    'redFlags': [
                        'Cannot hold head up while sitting by 6 months',
                        'Shows no interest in sitting position',
                        'Body is very stiff or very floppy when sitting',
                        'Cannot bear any weight on legs when supported'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Sitting without support',
                    'description': 'Baby can sit independently without any support',
                    'minMonths': 6,
                    'maxMonths': 8,
                    'order': 4,
                    'icon': '🧘',
                    'checklistItems': [
                        'Sits without support for 30+ seconds',
                        'Maintains balance while sitting',
                        'Can turn head while sitting without falling',
                        'May use hands for support occasionally (tripod sitting)'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/NWNGsMZMJy8',
                    'tips': [
                        'Encourage floor play in sitting position',
                        'Arrange toys in a circle around sitting baby',
                        'Let baby practice reaching while sitting',
                        'Praise attempts even if baby falls over',
                        'Create safe space with soft surfaces while learning'
                    ],
                    'safetyWarnings': [
                        'Pad the area around baby while learning',
                        'Remove sharp objects and hard toys from reach',
                        'Never leave baby sitting on elevated surfaces',
                        'Ensure stable, flat surface for sitting practice',
                        'Baby may suddenly lunge for toys - stay close'
                    ],
                    'whatToExpect': 'Independent sitting typically develops between 6-8 months. Initially, baby may use "tripod" position with hands on floor for support. Soon they will sit with straight back and free hands to play with toys. This opens up a whole new world of exploration and play for your baby!',
                    'redFlags': [
                        'Cannot sit without support by 9 months',
                        'Always falls to one particular side',
                        'Extremely rounded back while sitting',
                        'No attempt to catch themselves when falling'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Crawling',
                    'description': 'Baby can move around on hands and knees',
                    'minMonths': 7,
                    'maxMonths': 10,
                    'order': 5,
                    'icon': '🐛',
                    'checklistItems': [
                        'Moves forward on hands and knees',
                        'Alternates arm and leg movements',
                        'Can crawl to reach desired toys',
                        'May use different crawling styles (army crawl, scoot, etc.)'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/Gphok28coOk',
                    'tips': [
                        'Create safe crawling space at home',
                        'Place toys just out of reach to encourage movement',
                        'Get down on floor and crawl with baby',
                        'Ensure plenty of tummy time for muscle development',
                        'Some babies skip crawling - this is normal!'
                    ],
                    'safetyWarnings': [
                        'Baby-proof your home NOW - cover outlets, secure furniture',
                        'Install safety gates on stairs',
                        'Remove small objects baby could choke on',
                        'Keep cleaning supplies and medications locked away',
                        'Check floor for hazards daily - babies are fast!'
                    ],
                    'whatToExpect': 'Crawling styles vary widely - some babies do classic hands-and-knees, others army crawl, scoot on bottom, or roll to get places. Some skip crawling entirely and go straight to walking. What matters is that baby is finding ways to move and explore. Crawling develops coordination and spatial awareness.',
                    'redFlags': [
                        'No attempt to move or crawl by 12 months',
                        'Uses only one side of body to move',
                        'Drags one side while crawling',
                        'Shows no interest in exploring or moving toward objects'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Pulling to stand',
                    'description': 'Baby can pull themselves up to standing position using furniture',
                    'minMonths': 8,
                    'maxMonths': 11,
                    'order': 6,
                    'icon': '🧍',
                    'checklistItems': [
                        'Pulls up to standing using furniture',
                        'Bears full weight on legs',
                        'Can hold standing position for a few seconds',
                        'May bounce or step while standing'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/AZFPKR5LoQQ',
                    'tips': [
                        'Provide stable, sturdy furniture for pulling up',
                        'Encourage standing during play',
                        'Let baby practice lowering down safely',
                        'Bare feet are best for balance and grip',
                        'Be patient - baby may get stuck standing at first!'
                    ],
                    'safetyWarnings': [
                        'Anchor all heavy furniture to walls - tip-over hazard!',
                        'Pad sharp furniture corners',
                        'Remove unstable items baby might grab',
                        'Keep floor clear of slipping hazards',
                        'Watch for falls - babies learning to stand fall often'
                    ],
                    'whatToExpect': 'Once baby masters pulling to stand, they may get "stuck" standing and cry for help getting down. This is normal! They need to learn the controlled lowering motion. Your baby will practice pulling up on everything - furniture, your legs, even the dog! Standing strengthens leg muscles needed for walking.',
                    'redFlags': [
                        'Cannot bear weight on legs by 12 months',
                        'Shows no interest in standing',
                        'Stands only on tiptoes consistently',
                        'Legs cross or appear very stiff when standing'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Cruising (holding furniture and walking)',
                    'description': 'Baby walks while holding onto furniture for support',
                    'minMonths': 9,
                    'maxMonths': 12,
                    'order': 7,
                    'icon': '🚶',
                    'checklistItems': [
                        'Walks sideways holding furniture',
                        'Moves from one furniture piece to another',
                        'Can reach for toys while cruising',
                        'Shows confidence in standing balance'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/qqJvX0kMmFM',
                    'tips': [
                        'Arrange furniture to create cruising pathway',
                        'Place toys along the cruising route',
                        'Encourage cruising by standing at furniture end',
                        'Celebrate each cruising attempt',
                        'Let baby cruise barefoot for better grip'
                    ],
                    'safetyWarnings': [
                        'Ensure all furniture is stable and anchored',
                        'Remove wheels from furniture baby uses for support',
                        'Clear pathways of clutter and toys',
                        'Be ready to catch tumbles',
                        'Watch for pinched fingers in furniture gaps'
                    ],
                    'whatToExpect': 'Cruising is the bridge between standing and walking. Your baby will sidestep along furniture, gaining confidence and balance. They may cruise for weeks or months before taking independent steps. Some babies cruise backward before going forward! This is all normal development.',
                    'redFlags': [
                        'No cruising or walking attempts by 15 months',
                        'Cannot stand even with support by 12 months',
                        'Significant asymmetry in leg use',
                        'Extreme toe-walking while cruising'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'First steps',
                    'description': 'Baby takes their first independent steps',
                    'minMonths': 10,
                    'maxMonths': 15,
                    'order': 8,
                    'icon': '👣',
                    'checklistItems': [
                        'Takes 2-3 independent steps',
                        'Can stand alone for a few seconds',
                        'May walk with arms raised for balance',
                        'Shows excitement about walking'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/Kc6cNXL39LY',
                    'tips': [
                        'Encourage walking between parents (short distances)',
                        'Praise every walking attempt',
                        'Use favorite toys to motivate walking',
                        'Keep shoes off indoors - bare feet are best',
                        'Don\'t rush - every baby has their own timeline'
                    ],
                    'safetyWarnings': [
                        'Stay close during early walking - falls are frequent',
                        'Clear walking paths of obstacles',
                        'Ensure safe landing surfaces',
                        'Use shoes only when walking outside',
                        'Watch for toe-stubbing hazards'
                    ],
                    'whatToExpect': 'First steps are an exciting milestone! Early walkers typically take a few wobbly steps before falling or sitting down. Arms may be held high for balance, giving a "Frankenstein" appearance. This is normal! Walking develops gradually over weeks and months.',
                    'redFlags': [
                        'No walking attempts by 18 months',
                        'Cannot stand alone by 15 months',
                        'Walks exclusively on tiptoes',
                        'Significant limp or favoring one leg'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Walking independently',
                    'description': 'Baby can walk on their own without support',
                    'minMonths': 12,
                    'maxMonths': 18,
                    'order': 9,
                    'icon': '🚶‍♂️',
                    'checklistItems': [
                        'Walks across room without support',
                        'Can start and stop walking',
                        'Walks with improving balance',
                        'May start to run or climb'
                    ],
                    'videoUrl': 'https://www.youtube.com/embed/W3W3R3OKbKs',
                    'tips': [
                        'Provide plenty of safe walking practice',
                        'Take baby for short outdoor walks',
                        'Play active games that encourage walking',
                        'Let baby push/pull walking toys',
                        'Bare feet indoors help with balance development'
                    ],
                    'safetyWarnings': [
                        'Supervise outdoor walking - traffic and hazards',
                        'Use well-fitted shoes for outdoor walking only',
                        'Watch for climbing attempts - new danger!',
                        'Pool safety is critical - walking babies can reach water',
                        'Keep stair gates closed - climbing skills developing'
                    ],
                    'whatToExpect': 'Independent walking typically develops between 12-18 months. Early walking is often wide-legged and wobbly. Over time, balance improves and walking becomes smooth. Soon baby will run, jump, and climb! Remember: later walkers are just as normal as early walkers.',
                    'redFlags': [
                        'No independent walking by 18 months (consult doctor)',
                        'Persistent toe-walking after several months of walking',
                        'Significant balance problems or frequent falling',
                        'Loss of previously acquired walking skills'
                    ],
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                }
            ]
            
            self.developmental_milestones.insert_many(milestones)
            
            return {'message': f'Successfully seeded {len(milestones)} milestones'}, 201
        except Exception as e:
            return {'error': f'Failed to seed milestones: {str(e)}'}, 500
