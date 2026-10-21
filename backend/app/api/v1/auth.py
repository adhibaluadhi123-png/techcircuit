"""Authentication and User Management Routes."""
import uuid
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.domain import Token, LoginRequest, UserResponse, UserCreate
from app.core.security import (
    verify_password, create_access_token, hash_password,
    get_current_user, require_roles
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RoleUpdateRequest(BaseModel):
    role: str


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password, returning signed JWT token with role information."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "workspace_id": user.workspace_id
    }
    access_token = create_access_token(token_data)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        workspace_id=user.workspace_id
    )


@router.post("/register", response_model=Token)
def register(request: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    SECURITY: Public self-registration ALWAYS defaults to unprivileged 'CREATOR' role.
    Privileged roles (ADMIN, APPROVER, BRAND_MANAGER) cannot be self-assigned.
    """
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    workspace_id = settings.DEFAULT_WORKSPACE_ID
    # Server-side role assignment: always CREATOR for public registration
    assigned_role = "CREATOR"

    new_user = User(
        id=f"usr-{uuid.uuid4().hex[:8]}",
        workspace_id=workspace_id,
        email=request.email,
        full_name=request.full_name,
        role=assigned_role,
        hashed_password=hash_password(request.password),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token_data = {
        "sub": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "workspace_id": new_user.workspace_id
    }
    access_token = create_access_token(token_data)

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        workspace_id=new_user.workspace_id
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Return authenticated caller's profile derived strictly from verified JWT credentials."""
    return current_user


@router.get("/users", response_model=List[UserResponse])
def list_workspace_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List users belonging strictly to the authenticated user's workspace."""
    users = db.query(User).filter(
        User.workspace_id == current_user.workspace_id,
        User.is_active.is_(True)
    ).all()
    return users


@router.put("/users/{target_user_id}/role", response_model=UserResponse)
def update_user_role(
    target_user_id: str,
    payload: RoleUpdateRequest,
    current_user: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db)
):
    """
    Update a user's role. Restricted strictly to authorized Workspace Administrators.
    Validates that target user belongs to the same workspace.
    """
    valid_roles = ["ADMIN", "BRAND_MANAGER", "CREATOR", "AUTHORISED_REVIEWER", "APPROVER"]
    if payload.role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{payload.role}'. Must be one of: {', '.join(valid_roles)}"
        )
    
    target_user = db.query(User).filter(
        User.id == target_user_id,
        User.workspace_id == current_user.workspace_id
    ).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found in this workspace.")
    
    target_user.role = payload.role
    db.commit()
    db.refresh(target_user)
    return target_user
