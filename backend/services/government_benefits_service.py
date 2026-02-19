"""
Government Benefits Service: Manages government benefit programs like PMSMA
"""
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Tuple, Optional
from bson import ObjectId


class GovernmentBenefitsService:
    def __init__(self, users_collection, visits_collection):
        self.users = users_collection
        self.visits = visits_collection

    def initialize_pmsma(self, user_id: str, confirmation_date: Optional[str] = None, lmp: Optional[str] = None) -> Tuple[Dict[str, Any], int]:
        """
        Initialize PMSMA (Pradhan Mantri Surakshit Matritva Abhiyan) benefits for a pregnant woman.
        
        Args:
            user_id: User ID
            confirmation_date: Date when pregnancy was confirmed/registered
            lmp: Last Menstrual Period date (YYYY-MM-DD format)
        
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            # Check if user exists
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404

            # Check if benefits already initialized
            if user.get('governmentBenefits', {}).get('pmsma'):
                return {'message': 'PMSMA benefits already initialized'}, 200

            # Determine eligibility for installment 1 (must register within first 3 months)
            installment1_eligible = False
            if confirmation_date and lmp:
                try:
                    lmp_date = datetime.strptime(lmp, '%Y-%m-%d')
                    conf_date = datetime.strptime(confirmation_date, '%Y-%m-%d')
                    days_since_lmp = (conf_date - lmp_date).days
                    # Eligible if registered within 12 weeks (84 days)
                    installment1_eligible = 0 <= days_since_lmp <= 84
                except Exception:
                    pass

            # Initialize benefit structure
            pmsma_data = {
                'installments': [
                    {
                        'installmentNumber': 1,
                        'amount': 1000,
                        'eligibilityDate': confirmation_date if installment1_eligible else None,
                        'status': 'eligible_to_apply' if installment1_eligible else 'locked',
                        'paidDate': None,
                        'transactionId': None,
                        'eligibilityCriteria': 'pregnancy_registration_within_3_months',
                        'description': 'First installment for early pregnancy registration'
                    },
                    {
                        'installmentNumber': 2,
                        'amount': 2000,
                        'eligibilityDate': None,
                        'status': 'locked',
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
                'totalEligible': 1000 if installment1_eligible else 0,
                'totalPaid': 0,
                'progress': '1/3' if installment1_eligible else '0/3',
                'programName': 'Pradhan Mantri Surakshit Matritva Abhiyan',
                'programShortName': 'PMSMA',
                'createdAt': datetime.now(timezone.utc)
            }

            # Update user document
            result = self.users.update_one(
                {'_id': ObjectId(user_id)},
                {
                    '$set': {
                        'governmentBenefits.pmsma': pmsma_data,
                        'updatedAt': datetime.now(timezone.utc)
                    }
                }
            )

            if result.matched_count == 0:
                return {'error': 'Failed to initialize benefits'}, 500

            return {
                'message': 'PMSMA benefits initialized successfully',
                'benefits': pmsma_data
            }, 201

        except Exception as e:
            return {'error': f'Failed to initialize PMSMA: {str(e)}'}, 500

    def check_and_unlock_installment2(self, user_id: str) -> Tuple[Dict[str, Any], int]:
        """
        Check if user has ANC visit(s) and unlock installment 2 if eligible.
        
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            # Check if user has at least one ANC visit
            visit_count = self.visits.count_documents({'userId': ObjectId(user_id)})
            
            if visit_count == 0:
                return {'message': 'No ANC visits recorded yet'}, 200

            # Get user's current benefit status
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404

            pmsma = user.get('governmentBenefits', {}).get('pmsma')
            if not pmsma:
                return {'error': 'PMSMA benefits not initialized'}, 400

            # Check installment 2 status
            installment2 = pmsma['installments'][1]  # Index 1 for second installment
            
            if installment2['status'] != 'locked':
                return {'message': 'Installment 2 already unlocked'}, 200

            # Unlock installment 2
            now = datetime.now(timezone.utc)
            result = self.users.update_one(
                {'_id': ObjectId(user_id)},
                {
                    '$set': {
                        'governmentBenefits.pmsma.installments.1.status': 'eligible_to_apply',
                        'governmentBenefits.pmsma.installments.1.eligibilityDate': now.isoformat(),
                        'governmentBenefits.pmsma.totalEligible': self._calculate_total_eligible(user_id),
                        'governmentBenefits.pmsma.progress': self._calculate_progress(user_id),
                        'updatedAt': now
                    }
                }
            )

            if result.matched_count == 0:
                return {'error': 'Failed to unlock installment 2'}, 500

            return {
                'message': 'Installment 2 unlocked!',
                'installment': 2,
                'amount': 2000,
                'status': 'eligible'
            }, 200

        except Exception as e:
            return {'error': f'Failed to check installment 2: {str(e)}'}, 500

    def check_and_unlock_installment3(self, user_id: str) -> Tuple[Dict[str, Any], int]:
        """
        Check if birth is recorded and unlock installment 3 if eligible.
        
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            # Get user's current status
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404

            # Check if birth is recorded
            maternal_health = user.get('maternalHealth', {})
            if maternal_health.get('pregnancyStatus') != 'delivered':
                return {'message': 'Birth not yet recorded'}, 200

            pmsma = user.get('governmentBenefits', {}).get('pmsma')
            if not pmsma:
                return {'error': 'PMSMA benefits not initialized'}, 400

            # Check installment 3 status
            installment3 = pmsma['installments'][2]  # Index 2 for third installment
            
            if installment3['status'] != 'locked':
                return {'message': 'Installment 3 already unlocked'}, 200

            # Unlock installment 3
            now = datetime.now(timezone.utc)
            result = self.users.update_one(
                {'_id': ObjectId(user_id)},
                {
                    '$set': {
                        'governmentBenefits.pmsma.installments.2.status': 'eligible_to_apply',
                        'governmentBenefits.pmsma.installments.2.eligibilityDate': now.isoformat(),
                        'governmentBenefits.pmsma.totalEligible': self._calculate_total_eligible(user_id),
                        'governmentBenefits.pmsma.progress': self._calculate_progress(user_id),
                        'updatedAt': now
                    }
                }
            )

            if result.matched_count == 0:
                return {'error': 'Failed to unlock installment 3'}, 500

            return {
                'message': 'Installment 3 unlocked!',
                'installment': 3,
                'amount': 2000,
                'status': 'eligible'
            }, 200

        except Exception as e:
            return {'error': f'Failed to check installment 3: {str(e)}'}, 500

    def get_benefit_summary(self, user_id: str) -> Tuple[Dict[str, Any], int]:
        """
        Get PMSMA benefit summary for a user.
        
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404

            pmsma = user.get('governmentBenefits', {}).get('pmsma')
            if not pmsma:
                return {
                    'hasBenefits': False,
                    'message': 'PMSMA benefits not initialized'
                }, 200

            return {
                'hasBenefits': True,
                'benefits': pmsma
            }, 200

        except Exception as e:
            return {'error': f'Failed to get benefit summary: {str(e)}'}, 500

    def mark_installment_paid(self, user_id: str, installment_number: int, transaction_id: Optional[str] = None) -> Tuple[Dict[str, Any], int]:
        """
        Mark an installment as paid (ASHA worker action).
        
        Args:
            user_id: User ID
            installment_number: Installment number (1, 2, or 3)
            transaction_id: Optional transaction reference
        
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            if installment_number not in [1, 2, 3]:
                return {'error': 'Invalid installment number'}, 400

            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404

            pmsma = user.get('governmentBenefits', {}).get('pmsma')
            if not pmsma:
                return {'error': 'PMSMA benefits not initialized'}, 400

            # Get installment
            installment = pmsma['installments'][installment_number - 1]

            # Verify current status
            if installment['status'] == 'paid':
                return {'error': 'Installment already marked as paid'}, 400

            if installment['status'] == 'locked':
                return {'error': 'Installment not yet eligible'}, 400

            # Mark as paid
            now = datetime.now(timezone.utc)
            index = installment_number - 1
            
            result = self.users.update_one(
                {
                    '_id': ObjectId(user_id),
                    f'governmentBenefits.pmsma.installments.{index}.status': {'$in': ['eligible', 'approved', 'eligible_to_apply']}
                },
                {
                    '$set': {
                        f'governmentBenefits.pmsma.installments.{index}.status': 'paid',
                        f'governmentBenefits.pmsma.installments.{index}.paidDate': now.isoformat(),
                        f'governmentBenefits.pmsma.installments.{index}.transactionId': transaction_id or f'TXN-{int(now.timestamp())}',
                        'governmentBenefits.pmsma.totalPaid': self._calculate_total_paid(user_id, installment_number),
                        'updatedAt': now
                    }
                }
            )

            if result.matched_count == 0:
                return {'error': 'Failed to mark installment as paid. Check if status is eligible.'}, 500

            return {
                'message': f'Installment {installment_number} marked as paid successfully',
                'installment': installment_number,
                'amount': installment['amount'],
                'paidDate': now.isoformat()
            }, 200

        except Exception as e:
            return {'error': f'Failed to mark installment as paid: {str(e)}'}, 500

    def submit_application(self, user_id: str, installment_number: int, application_data: Dict[str, Any] = None) -> Tuple[Dict[str, Any], int]:
        """
        Submit application for a PMSMA installment.
        
        For installment 1: Stores bank account + payment details
        For installments 2 & 3: Simple confirmation (reuses installment 1 data)
        
        Args:
            user_id: User ID
            installment_number: 1, 2, or 3
            application_data: Dict containing payment details (required for installment 1 only)
                - accountNumber
                - accountHolderName  
                - ifscCode
                - bankName
        
        Returns:
            Tuple of (response_dict, status_code)
        """
        try:
            # Get user's current benefit status
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404

            pmsma = user.get('governmentBenefits', {}).get('pmsma')
            if not pmsma:
                return {'error': 'PMSMA benefits not initialized'}, 400

            # Validate installment number
            if installment_number not in [1, 2, 3]:
                return {'error': 'Invalid installment number. Must be 1, 2, or 3'}, 400

            # Get the specific installment
            installment_index = installment_number - 1
            installment = pmsma['installments'][installment_index]

            # Check if installment is eligible to apply
            if installment['status'] not in ['eligible', 'eligible_to_apply']:
                current_status = installment['status']
                return {
                    'error': f'Installment {installment_number} is not eligible for application. Current status: {current_status}'
                }, 400

            # For installment 1: Validate and store payment details
            if installment_number == 1:
                if not application_data:
                    return {'error': 'Payment details are required for installment 1'}, 400
                
                # Validate required fields
                required_fields = ['accountNumber', 'accountHolderName', 'ifscCode', 'bankName']
                missing_fields = [field for field in required_fields if not application_data.get(field)]
                
                if missing_fields:
                    return {
                        'error': f'Missing required fields: {", ".join(missing_fields)}'
                    }, 400

                # Store payment details in pmsma object
                payment_details = {
                    'accountNumber': application_data['accountNumber'],
                    'accountHolderName': application_data['accountHolderName'],
                    'ifscCode': application_data['ifscCode'].upper(),
                    'bankName': application_data['bankName'],
                    'submittedDate': datetime.now(timezone.utc).isoformat()
                }

            # For installments 2 & 3: Verify payment details exist from installment 1
            else:
                payment_details_exist = pmsma.get('paymentDetails')
                if not payment_details_exist:
                    return {
                        'error': 'Payment details not found. Please complete installment 1 application first.'
                    }, 400

            # Prepare update
            now = datetime.now(timezone.utc)
            update_fields = {
                f'governmentBenefits.pmsma.installments.{installment_index}.status': 'application_submitted',
                f'governmentBenefits.pmsma.installments.{installment_index}.application': {
                    'submittedDate': now.isoformat(),
                    'status': 'submitted'
                },
                'updatedAt': now
            }

            # Add payment details only for installment 1
            if installment_number == 1:
                update_fields['governmentBenefits.pmsma.paymentDetails'] = payment_details

            # Update user document
            result = self.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': update_fields}
            )

            if result.matched_count == 0:
                return {'error': 'Failed to submit application'}, 500

            return {
                'message': f'Application for installment {installment_number} submitted successfully',
                'installmentNumber': installment_number,
                'status': 'application_submitted',
                'submittedDate': now.isoformat()
            }, 200

        except Exception as e:
            return {'error': f'Failed to submit application: {str(e)}'}, 500

    def _calculate_total_eligible(self, user_id: str) -> int:
        """Calculate total eligible amount"""
        user = self.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return 0
        
        pmsma = user.get('governmentBenefits', {}).get('pmsma', {})
        total = 0
        for inst in pmsma.get('installments', []):
            if inst['status'] in ['eligible', 'paid']:
                total += inst['amount']
        return total

    def _calculate_total_paid(self, user_id: str, new_installment: int = None) -> int:
        """Calculate total paid amount"""
        user = self.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return 0
        
        pmsma = user.get('governmentBenefits', {}).get('pmsma', {})
        total = 0
        for i, inst in enumerate(pmsma.get('installments', [])):
            if inst['status'] == 'paid' or (new_installment and i == new_installment - 1):
                total += inst['amount']
        return total

    def _calculate_progress(self, user_id: str) -> str:
        """Calculate progress as 'X/3' format"""
        user = self.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return '0/3'
        
        pmsma = user.get('governmentBenefits', {}).get('pmsma', {})
        count = 0
        for inst in pmsma.get('installments', []):
            if inst['status'] in ['eligible', 'paid']:
                count += 1
        return f'{count}/3'
    
    def get_pending_applications(self) -> Tuple[Dict[str, Any], int]:
        """Get all PMSMA applications pending approval for Anganwadi workers."""
        try:
            users = self.users.find({
                'governmentBenefits.pmsma.installments': {
                    '$elemMatch': {'status': 'application_submitted'}
                }
            })
            
            pending_applications = []
            for user in users:
                pmsma = user.get('governmentBenefits', {}).get('pmsma', {})
                payment_details = pmsma.get('paymentDetails', {})
                
                for installment in pmsma.get('installments', []):
                    if installment['status'] == 'application_submitted':
                        pending_applications.append({
                            'userId': str(user['_id']),
                            'motherName': user.get('name', 'N/A'),
                            'email': user.get('email', 'N/A'),
                            'phone': user.get('phone', 'N/A'),
                            'installmentNumber': installment['installmentNumber'],
                            'amount': installment['amount'],
                            'submittedDate': installment.get('application', {}).get('submittedDate'),
                            'paymentDetails': {
                                'accountHolderName': payment_details.get('accountHolderName', 'N/A'),
                                'accountNumber': payment_details.get('accountNumber', 'N/A'),
                                'ifscCode': payment_details.get('ifscCode', 'N/A'),
                                'bankName': payment_details.get('bankName', 'N/A')
                            }
                        })
            
            return {'applications': pending_applications, 'total': len(pending_applications)}, 200
            
        except Exception as e:
            print(f"Error getting pending applications: {str(e)}")
            return {'error': 'Failed to get pending applications'}, 500
    
    def approve_application(self, user_id: str, installment_number: int) -> Tuple[Dict[str, Any], int]:
        """Approve a PMSMA application (Anganwadi action)."""
        try:
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return {'error': 'User not found'}, 404
            
            pmsma = user.get('governmentBenefits', {}).get('pmsma')
            if not pmsma:
                return {'error': 'PMSMA benefits not found'}, 404
            
            installment_index = installment_number - 1
            installment = pmsma['installments'][installment_index]
            
            if installment['status'] != 'application_submitted':
                return {'error': f'Installment {installment_number} is not pending approval'}, 400
            
            now = datetime.now(timezone.utc)
            result = self.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {
                    f'governmentBenefits.pmsma.installments.{installment_index}.status': 'approved',
                    f'governmentBenefits.pmsma.installments.{installment_index}.application.status': 'approved',
                    f'governmentBenefits.pmsma.installments.{installment_index}.application.approvedDate': now.isoformat(),
                    'updatedAt': now
                }}
            )
            
            if result.matched_count == 0:
                return {'error': 'Failed to approve application'}, 500
            
            return {
                'message': f'Application approved successfully',
                'installmentNumber': installment_number,
                'status': 'approved'
            }, 200
            
        except Exception as e:
            print(f"Error approving application: {str(e)}")
            return {'error': 'Failed to approve application'}, 500
