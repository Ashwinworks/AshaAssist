from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .utils import generate_jwt, token_required
from bson import ObjectId

def register_user(db):
    data = request.get_json()
    if db.users.find_one({"email": data["email"]}):
        return jsonify({"message": "Email already exists."}), 400
    data["password"] = generate_password_hash(data["password"])
    data["approved"] = data.get("role") != "asha"
    db.users.insert_one(data)
    return jsonify({"message": "Registered successfully."}), 201

def login_user(db):
    data = request.get_json()
    user = db.users.find_one({"email": data["email"]})
    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Invalid credentials."}), 401
    if user["role"] == "asha" and not user.get("approved", False):
        return jsonify({"message": "ASHA not approved yet."}), 403
    token = generate_jwt(user["_id"], user["role"])
    return jsonify({"token": token, "role": user["role"]}), 200

@token_required
def patient_request_visit(current_user, db):
    data = request.get_json()
    req = {
        "patient_id": current_user["user_id"],
        "reason": data["reason"],
        "preferred_date": data["preferred_date"],
        "status": "pending"
    }
    db.visit_requests.insert_one(req)
    return jsonify({"message": "Request submitted."}), 201

@token_required
def asha_log_visit(current_user, db):
    data = request.get_json()
    log = {
        "asha_id": current_user["user_id"],
        "patient_id": data["patient_id"],
        "visit_date": data["visit_date"],
        "vaccine_update": data["vaccine_update"],
        "birth_report": data["birth_report"],
        "death_report": data["death_report"]
    }
    db.asha_reports.insert_one(log)
    return jsonify({"message": "Visit logged."}), 201

@token_required
def admin_get_asha_reports(current_user, db):
    reports = list(db.asha_reports.find())
    for r in reports:
        r["_id"] = str(r["_id"])
    return jsonify(reports), 200

@token_required
def admin_get_requests(current_user, db):
    requests = list(db.users.find({"role": "asha", "approved": False}))
    for r in requests:
        r["_id"] = str(r["_id"])
    return jsonify(requests), 200

@token_required
def admin_approve_asha(current_user, db, asha_id):
    db.users.update_one({"_id": ObjectId(asha_id)}, {"$set": {"approved": True}})
    return jsonify({"message": "ASHA approved."}), 200