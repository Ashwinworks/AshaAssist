from datetime import datetime

user_schema = {
    "name": str,
    "email": str,
    "password": str,
    "role": str,
    "approved": bool,
}

asha_worker_schema = {
    "name": str,
    "email": str,
    "password": str,
    "approved": bool,
    "assigned_patients": list,
}

admin_schema = {
    "name": str,
    "email": str,
    "password": str,
}

vaccination_record_schema = {
    "patient_id": str,
    "vaccine_name": str,
    "date_given": datetime,
    "next_due": datetime,
}

visit_request_schema = {
    "patient_id": str,
    "reason": str,
    "preferred_date": datetime,
    "status": str,
}

product_request_schema = {
    "patient_id": str,
    "product_type": str,
    "quantity": int,
    "status": str,
}