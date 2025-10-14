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
                    'icon': milestone.get('icon', '🎯')
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
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Sitting with support',
                    'description': 'Baby can sit upright with support from parent or cushions',
                    'minMonths': 6,
                    'maxMonths': 6,
                    'order': 3,
                    'icon': '🪑',
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Sitting without support',
                    'description': 'Baby can sit independently without any support',
                    'minMonths': 8,
                    'maxMonths': 8,
                    'order': 4,
                    'icon': '🧘',
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Crawling',
                    'description': 'Baby can move around on hands and knees',
                    'minMonths': 7,
                    'maxMonths': 9,
                    'order': 5,
                    'icon': '🐛',
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Pulling to stand',
                    'description': 'Baby can pull themselves up to standing position using furniture',
                    'minMonths': 9,
                    'maxMonths': 11,
                    'order': 6,
                    'icon': '🧍',
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'Cruising (holding furniture and walking)',
                    'description': 'Baby walks while holding onto furniture for support',
                    'minMonths': 10,
                    'maxMonths': 12,
                    'order': 7,
                    'icon': '🚶',
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                },
                {
                    'milestoneName': 'First steps',
                    'description': 'Baby takes their first independent steps',
                    'minMonths': 12,
                    'maxMonths': 15,
                    'order': 8,
                    'icon': '👣',
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
                    'isActive': True,
                    'createdAt': datetime.now(timezone.utc)
                }
            ]
            
            self.developmental_milestones.insert_many(milestones)
            
            return {'message': f'Successfully seeded {len(milestones)} milestones'}, 201
        except Exception as e:
            return {'error': f'Failed to seed milestones: {str(e)}'}, 500
