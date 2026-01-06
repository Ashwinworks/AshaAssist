"""
Helper utilities for maternal health status checks
"""

def is_pregnancy_recorded(user):
    """Check if user has completed their pregnancy profile"""
    if not user or user.get('beneficiaryCategory') != 'maternity':
        return False
    
    maternal_health = user.get('maternalHealth', {})
    return maternal_health.get('pregnancyStatus') is not None


def is_delivered(user):
    """Check if mother has delivered"""
    if not user or user.get('beneficiaryCategory') != 'maternity':
        return False
    
    maternal_health = user.get('maternalHealth', {})
    return maternal_health.get('pregnancyStatus') == 'delivered'


def is_pregnant(user):
    """Check if mother is currently pregnant"""
    if not user or user.get('beneficiaryCategory') != 'maternity':
        return False
    
    maternal_health = user.get('maternalHealth', {})
    return maternal_health.get('pregnancyStatus') == 'pregnant'


def can_book_vaccination(user):
    """Check if user can book vaccinations (must be delivered)"""
    return is_delivered(user)


def get_pregnancy_status(user):
    """Get pregnancy status string"""
    if not user or user.get('beneficiaryCategory') != 'maternity':
        return None
    
    maternal_health = user.get('maternalHealth', {})
    return maternal_health.get('pregnancyStatus')


def get_children_ids(user):
    """Get list of children IDs for a mother"""
    if not user or user.get('beneficiaryCategory') != 'maternity':
        return []
    
    maternal_health = user.get('maternalHealth', {})
    return maternal_health.get('children', [])
