from flask import Blueprint, current_app
from pymongo import MongoClient
import os
from .controllers import (
    register_user, login_user, patient_request_visit,
    asha_log_visit, admin_get_asha_reports, admin_get_requests, admin_approve_asha
)

bp = Blueprint("api", __name__, url_prefix="/api")

def get_db():
    client = MongoClient(os.getenv("MONGO_URI"))
    return client["ashaassist"]

@bp.route("/register", methods=["POST"])
def register():
    db = get_db()
    return register_user(db)

@bp.route("/login", methods=["POST"])
def login():
    db = get_db()
    return login_user(db)

@bp.route("/patient/request-visit", methods=["POST"])
def patient_request():
    db = get_db()
    return patient_request_visit(db=db)

@bp.route("/asha/log-visit", methods=["POST"])
def asha_log():
    db = get_db()
    return asha_log_visit(db=db)

@bp.route("/admin/asha-reports", methods=["GET"])
def admin_reports():
    db = get_db()
    return admin_get_asha_reports(db=db)

@bp.route("/admin/requests", methods=["GET"])
def admin_requests():
    db = get_db()
    return admin_get_requests(db=db)

@bp.route("/admin/approve-asha/<asha_id>", methods=["POST"])
def admin_approve(asha_id):
    db = get_db()
    return admin_approve_asha(db=db, asha_id=asha_id)