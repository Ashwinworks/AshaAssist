"""
Vaccination utility functions for calculating vaccination schedules
"""
from datetime import datetime, timedelta

# Indian Universal Immunization Program Schedule
VACCINATION_SCHEDULE = [
    # At Birth (≤24 hours / ≤15 days)
    {"vaccineName": "BCG", "ageInDays": 0, "ageLabel": "At Birth", "description": "Tuberculosis vaccine - Intradermal", "category": "birth"},
    {"vaccineName": "Hepatitis B (Birth Dose)", "ageInDays": 0, "ageLabel": "At Birth (≤24 hrs)", "description": "Hepatitis B - Intramuscular", "category": "birth"},
    {"vaccineName": "OPV-0 (Zero Dose)", "ageInDays": 0, "ageLabel": "At Birth (≤15 days)", "description": "Polio - Oral", "category": "birth"},
    
    # 6 Weeks
    {"vaccineName": "OPV-1", "ageInDays": 42, "ageLabel": "6 Weeks", "description": "Polio - Oral (Dose 2)", "category": "6-weeks"},
    {"vaccineName": "Pentavalent-1", "ageInDays": 42, "ageLabel": "6 Weeks", "description": "DPT + Hepatitis B + Hib - Intramuscular (Dose 1)", "category": "6-weeks"},
    {"vaccineName": "Rotavirus-1", "ageInDays": 42, "ageLabel": "6 Weeks", "description": "Diarrhea prevention - Oral (Dose 1)", "category": "6-weeks"},
    {"vaccineName": "IPV-1 (Fractional)", "ageInDays": 42, "ageLabel": "6 Weeks", "description": "Inactivated Polio Vaccine - Intramuscular fractional dose (Dose 1)", "category": "6-weeks"},
    
    # 10 Weeks
    {"vaccineName": "OPV-2", "ageInDays": 70, "ageLabel": "10 Weeks", "description": "Polio - Oral (Dose 3)", "category": "10-weeks"},
    {"vaccineName": "Pentavalent-2", "ageInDays": 70, "ageLabel": "10 Weeks", "description": "DPT + Hepatitis B + Hib - Intramuscular (Dose 2)", "category": "10-weeks"},
    {"vaccineName": "Rotavirus-2", "ageInDays": 70, "ageLabel": "10 Weeks", "description": "Diarrhea prevention - Oral (Dose 2)", "category": "10-weeks"},
    
    # 14 Weeks
    {"vaccineName": "OPV-3", "ageInDays": 98, "ageLabel": "14 Weeks", "description": "Polio - Oral (Dose 4)", "category": "14-weeks"},
    {"vaccineName": "Pentavalent-3", "ageInDays": 98, "ageLabel": "14 Weeks", "description": "DPT + Hepatitis B + Hib - Intramuscular (Dose 3)", "category": "14-weeks"},
    {"vaccineName": "Rotavirus-3", "ageInDays": 98, "ageLabel": "14 Weeks", "description": "Diarrhea prevention - Oral (Dose 3)", "category": "14-weeks"},
    {"vaccineName": "IPV-2 (Fractional)", "ageInDays": 98, "ageLabel": "14 Weeks", "description": "Inactivated Polio Vaccine - Intramuscular fractional dose (Dose 2)", "category": "14-weeks"},
    
    # 9-12 Months
    {"vaccineName": "MR-1 (Measles-Rubella)", "ageInDays": 270, "ageLabel": "9-12 Months", "description": "Measles + Rubella - Subcutaneous (Dose 1)", "category": "9-12-months"},
    {"vaccineName": "JE-1 (Japanese Encephalitis)", "ageInDays": 270, "ageLabel": "9-12 Months", "description": "Japanese Encephalitis - Subcutaneous (Dose 1)", "category": "9-12-months"},
    {"vaccineName": "Vitamin A (1st Dose)", "ageInDays": 270, "ageLabel": "9 Months", "description": "Vitamin A Deficiency prevention - Oral", "category": "9-12-months"},
    
    # 16-24 Months
    {"vaccineName": "MR-2 (Measles-Rubella)", "ageInDays": 547, "ageLabel": "16-24 Months", "description": "Measles + Rubella - Subcutaneous (Dose 2)", "category": "16-24-months"},
    {"vaccineName": "JE-2 (Japanese Encephalitis)", "ageInDays": 547, "ageLabel": "16-24 Months", "description": "Japanese Encephalitis - Subcutaneous (Dose 2)", "category": "16-24-months"},
    {"vaccineName": "OPV Booster", "ageInDays": 547, "ageLabel": "16-24 Months", "description": "Polio booster - Oral", "category": "16-24-months"},
    {"vaccineName": "DPT Booster-1", "ageInDays": 547, "ageLabel": "16-24 Months", "description": "Diphtheria + Pertussis + Tetanus booster - Intramuscular", "category": "16-24-months"},
    
    # 5-6 Years
    {"vaccineName": "DPT Booster-2", "ageInDays": 1825, "ageLabel": "5-6 Years", "description": "Diphtheria + Pertussis + Tetanus second booster - Intramuscular", "category": "5-6-years"},
    
    # 10 Years
    {"vaccineName": "TT (Tetanus Toxoid)", "ageInDays": 3650, "ageLabel": "10 Years", "description": "Tetanus protection - Intramuscular (Dose 1)", "category": "10-years"},
    
    # 16 Years
    {"vaccineName": "TT (Tetanus Toxoid)", "ageInDays": 5840, "ageLabel": "16 Years", "description": "Tetanus protection - Intramuscular (Dose 2)", "category": "16-years"},
]


def calculate_vaccination_milestones(date_of_birth):
    """
    Calculate all vaccination due dates based on date of birth
    
    Args:
        date_of_birth: datetime object or ISO string of child's birth date
    
    Returns:
        List of vaccination milestone dictionaries with due dates and status
    """
    # Parse date of birth and make it timezone-naive for consistency
    if isinstance(date_of_birth, str):
        dob = datetime.fromisoformat(date_of_birth.replace('Z', '+00:00'))
        # Convert to naive datetime
        if dob.tzinfo is not None:
            dob = dob.replace(tzinfo=None)
    else:
        dob = date_of_birth
        # Convert to naive datetime if it's timezone-aware
        if dob.tzinfo is not None:
            dob = dob.replace(tzinfo=None)
    
    milestones = []
    # Use timezone-naive datetime for consistency
    today = datetime.now()
    
    for vaccine in VACCINATION_SCHEDULE:
        due_date = dob + timedelta(days=vaccine['ageInDays'])
        
        # Determine status
        days_diff = (due_date.date() - today.date()).days
        if days_diff < -7:
            status = 'overdue'
        elif days_diff <= 7:
            status = 'due'
        else:
            status = 'upcoming'
        
        milestone = {
            'vaccineName': vaccine['vaccineName'],
            'ageInDays': vaccine['ageInDays'],
            'ageLabel': vaccine['ageLabel'],
            'description': vaccine['description'],
            'dueDate': due_date.date().isoformat(),
            'status': status,
            'completedAt': None,
            'category': vaccine['category'],
            'notificationsSent': []
        }
        milestones.append(milestone)
    
    return milestones


def get_vaccination_status(due_date_str):
    """
    Determine vaccination status based on due date
    
    Args:
        due_date_str: ISO date string of when vaccination is due
    
    Returns:
        Status string: 'overdue', 'due', or 'upcoming'
    """
    due_date = datetime.fromisoformat(due_date_str).date()
    today = datetime.now().date()
    days_diff = (due_date - today).days
    
    if days_diff < -7:
        return 'overdue'
    elif days_diff <= 7:
        return 'due'
    else:
        return 'upcoming'
