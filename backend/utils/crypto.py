"""
Digital Signature Utility for Vaccination Certificates
Uses RSA asymmetric cryptography with SHA-256 for signing and verification
"""
import os
import base64
import hashlib
import json
from datetime import datetime
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend

# Key storage directory
KEY_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'keys')

def ensure_keys_exist():
    """Generate RSA key pair if they don't exist"""
    if not os.path.exists(KEY_DIR):
        os.makedirs(KEY_DIR)
    
    private_key_path = os.path.join(KEY_DIR, 'private_key.pem')
    public_key_path = os.path.join(KEY_DIR, 'public_key.pem')
    
    if not os.path.exists(private_key_path) or not os.path.exists(public_key_path):
        # Generate new 2048-bit RSA key pair
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        # Serialize and save private key (keep secure!)
        pem_private = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        with open(private_key_path, 'wb') as f:
            f.write(pem_private)
        
        # Serialize and save public key (can be shared)
        public_key = private_key.public_key()
        pem_public = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        with open(public_key_path, 'wb') as f:
            f.write(pem_public)
        
        print("✓ RSA key pair generated for certificate signing")


def load_private_key():
    """Load private key for signing"""
    ensure_keys_exist()
    private_key_path = os.path.join(KEY_DIR, 'private_key.pem')
    with open(private_key_path, 'rb') as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password=None,
            backend=default_backend()
        )
    return private_key


def load_public_key():
    """Load public key for verification"""
    ensure_keys_exist()
    public_key_path = os.path.join(KEY_DIR, 'public_key.pem')
    with open(public_key_path, 'rb') as f:
        public_key = serialization.load_pem_public_key(
            f.read(),
            backend=default_backend()
        )
    return public_key


def create_certificate_data(booking_id: str, child_name: str, parent_name: str, 
                            vaccines: list, vaccination_date: str, location: str) -> dict:
    """Create standardized certificate data for signing"""
    return {
        'certificate_id': booking_id,
        'child_name': child_name,
        'parent_name': parent_name,
        'vaccines': vaccines,
        'vaccination_date': vaccination_date,
        'location': location,
        'issued_at': datetime.utcnow().isoformat(),
        'issuer': 'AshaAssist Health Department'
    }


def sign_certificate(certificate_data: dict) -> str:
    """
    Sign certificate data using RSA-SHA256
    Returns: Base64-encoded signature
    """
    private_key = load_private_key()
    
    # Create canonical JSON representation for signing
    message = json.dumps(certificate_data, sort_keys=True, separators=(',', ':')).encode('utf-8')
    
    # Sign using RSA-PKCS1v15 with SHA-256
    signature = private_key.sign(
        message,
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    
    return base64.b64encode(signature).decode('utf-8')


def verify_certificate(certificate_data: dict, signature_b64: str) -> bool:
    """
    Verify certificate signature using public key
    Returns: True if signature is valid, False otherwise
    """
    try:
        public_key = load_public_key()
        signature = base64.b64decode(signature_b64)
        
        # Recreate the message that was signed
        message = json.dumps(certificate_data, sort_keys=True, separators=(',', ':')).encode('utf-8')
        
        # Verify signature
        public_key.verify(
            signature,
            message,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        return True
    except Exception as e:
        print(f"Signature verification failed: {e}")
        return False


def create_qr_data(certificate_data: dict, signature: str) -> str:
    """
    Create compact QR code data containing essential info + signature
    Returns: JSON string to encode in QR code
    """
    qr_payload = {
        'cid': certificate_data['certificate_id'],
        'cn': certificate_data['child_name'],
        'vd': certificate_data['vaccination_date'],
        'v': certificate_data['vaccines'],
        'sig': signature[:64] + '...'  # Truncated for display, full signature stored
    }
    return json.dumps(qr_payload, separators=(',', ':'))


def generate_verification_url(booking_id: str, signature: str) -> str:
    """
    Generate a URL for online certificate verification
    """
    # Create a verification hash (first 16 chars of signature for URL brevity)
    verification_code = signature[:16]
    # In production, this would be your actual domain
    base_url = os.environ.get('VERIFICATION_URL', 'http://localhost:3000')
    return f"{base_url}/verify-certificate/{booking_id}?code={verification_code}"


def get_certificate_hash(certificate_data: dict) -> str:
    """
    Generate SHA-256 hash of certificate data for quick integrity check
    """
    message = json.dumps(certificate_data, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return hashlib.sha256(message).hexdigest()
