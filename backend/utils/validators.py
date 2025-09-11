"""
Validation utilities for user input
"""
import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate Indian mobile number format"""
    pattern = r'^[6-9]\d{9}$'  # Indian mobile number format
    return re.match(pattern, phone) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, "Password is valid"

def validate_user_type(user_type):
    """Validate user type"""
    valid_types = ['user', 'asha_worker', 'admin']
    return user_type in valid_types

def validate_beneficiary_category(category):
    """Validate beneficiary category"""
    valid_categories = ['maternity', 'palliative']
    return category in valid_categories

