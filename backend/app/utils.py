import jwt
import os
from datetime import datetime, timedelta
from flask import request
from functools import wraps

def generate_jwt(user_id, role):
    payload = {
        "user_id": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")

def decode_jwt(token):
    try:
        return jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
        if not token:
            return {"message": "Token is missing!"}, 401
        data = decode_jwt(token)
        if not data:
            return {"message": "Token is invalid or expired!"}, 401
        return f(data, *args, **kwargs)
    return decorated