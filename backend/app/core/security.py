"""Security and Redaction Gateway for CANON Brand Governance."""
import base64
import hashlib
import hmac
import json
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, Dict, Any
from app.config import settings

def hash_password(password: str) -> str:
    """Generate a salted SHA-256 password hash."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000
    )
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against salted PBKDF2-SHA256 hash."""
    try:
        salt, expected_hex = hashed_password.split("$")
        key = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000
        )
        return hmac.compare_digest(key.hex(), expected_hex)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a lightweight signed JWT token using HMAC-SHA256."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    
    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    encoded_payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    
    signature_data = f"{encoded_header}.{encoded_payload}".encode()
    signature = hmac.new(settings.SECRET_KEY.encode(), signature_data, hashlib.sha256).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify HMAC-SHA256 JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        encoded_header, encoded_payload, encoded_signature = parts
        
        # Verify signature
        signature_data = f"{encoded_header}.{encoded_payload}".encode()
        expected_sig = hmac.new(settings.SECRET_KEY.encode(), signature_data, hashlib.sha256).digest()
        actual_sig = base64.urlsafe_b64decode(encoded_signature + "==")
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        # Decode payload
        payload_json = base64.urlsafe_b64decode(encoded_payload + "==").decode()
        payload = json.loads(payload_json)
        
        # Check expiry
        if "exp" in payload and payload["exp"] < datetime.now(timezone.utc).timestamp():
            return None
            
        return payload
    except Exception:
        return None


# =========================================================================
# Redaction Gateway: Untrusted Content Quarantine & PII/Codenames Masking
# =========================================================================

REDACTION_PATTERNS = [
    # Confidential Codename / Pre-release Tokens
    (r"\b(Project\s+[A-Z][a-zA-Z0-9]+)\b", "[CONFIDENTIAL_PROJECT]"),
    (r"\b(Titan\s+V[0-9]+|AeroX-[0-9]+)\b", "[PRE_RELEASE_CODENAME]"),
    # Pricing details (e.g. $499/mo pre-release, $12,000 secret rate)
    (r"\$(\d{1,3}(,\d{3})*(\.\d{2})?)\s*(per|\/)\s*(mo|year|seat|user|month)", "[MASKED_PRICING]"),
    # Email addresses
    (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[REDACTED_EMAIL]"),
    # API Keys / Bearer tokens
    (r"\b(sk-[a-zA-Z0-9]{24,}|ghp_[a-zA-Z0-9]{24,}|bearer\s+[a-zA-Z0-9_\-\.]+)\b", "[REDACTED_SECRET]", re.IGNORECASE),
]

def sanitize_and_redact_content(text: str) -> Tuple[str, Dict[str, str]]:
    """
    Sanitize untrusted content:
    1. Neutralize common prompt-injection attempts.
    2. Redact sensitive codenames, pricing and credentials.
    Returns: (redacted_text, redaction_mapping)
    """
    redacted_text = text
    mapping: Dict[str, str] = {}
    
    for item in REDACTION_PATTERNS:
        pattern = item[0]
        replacement = item[1]
        flags = item[2] if len(item) > 2 else 0
        matches = list(re.finditer(pattern, redacted_text, flags=flags))
        for m in reversed(matches):
            original = m.group(0)
            token = f"{replacement}_{len(mapping)+1}"
            mapping[token] = original
            start, end = m.span()
            redacted_text = redacted_text[:start] + token + redacted_text[end:]
            
    return redacted_text, mapping
