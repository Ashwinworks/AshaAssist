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
                        'status': 'eligible' if installment1_eligible else 'locked',
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
                        'governmentBenefits.pmsma.installments.1.status': 'eligible',
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
                        'governmentBenefits.pmsma.installments.2.status': 'eligible',
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
                    f'governmentBenefits.pmsma.installments.{index}.status': 'eligible'
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
