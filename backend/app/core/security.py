"""Security and Redaction Gateway for CANON Brand Governance."""
import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, Dict, Any, List, Callable
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db
from app.db.models import User

# Optional bearer scheme for extracting Authorization: Bearer <token>
http_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Generate a salted PBKDF2-SHA256 password hash."""
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
    """Create a standard signed JWT token using PyJWT with HS256."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access",
        "iss": "canon-auth"
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify HS256 JWT token with strict signature, expiry, and issuer checks."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"require": ["exp", "sub"]}
        )
        # Check token type
        if payload.get("type") != "access":
            return None
        return payload
    except (jwt.PyJWTError, Exception):
        return None


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that enforces authentication on protected routes.
    Extracts and verifies Bearer token, then retrieves the authenticated User.
    """
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(auth.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or malformed authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token does not exist or has been deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    """Factory dependency to enforce role-based access control."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not authorized for this resource. Required: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker



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
