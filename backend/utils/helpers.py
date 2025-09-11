"""
Helper utilities for common operations
"""
import json
from datetime import datetime, timedelta
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for MongoDB ObjectId and datetime"""
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

def parse_date(date_str):
    """Parse an ISO or YYYY-MM-DD string to a datetime (00:00:00)"""
    try:
        dt = datetime.fromisoformat(date_str)
        # Normalize to date boundary if time part present
        return datetime(dt.year, dt.month, dt.day)
    except Exception:
        return None

def parse_datetime(dt_str):
    """Parse datetime string with timezone support"""
    if isinstance(dt_str, str):
        try:
            return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        except Exception:
            pass
    return None

def calc_edd_from_lmp(lmp_dt):
    """Calculate Expected Due Date from Last Menstrual Period"""
    return lmp_dt + timedelta(days=280)

def calc_lmp_from_edd(edd_dt):
    """Calculate Last Menstrual Period from Expected Due Date"""
    return edd_dt - timedelta(days=280)

def gestational_week(lmp_dt, at_date):
    """Return integer gestational week (0..42) from LMP at given date"""
    if not lmp_dt:
        return None
    days = (at_date - lmp_dt).days
    if days < 0:
        return 0
    return days // 7

def normalize_inputs(data, fields):
    """Normalize input data by trimming strings"""
    for field in fields:
        if field in data and isinstance(data[field], str):
            data[field] = data[field].strip()
    return data

def to_iso_string(dt):
    """Convert datetime to ISO string"""
    if isinstance(dt, datetime):
        return dt.isoformat()
    return dt

