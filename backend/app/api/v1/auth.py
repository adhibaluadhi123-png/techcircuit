"""Authentication and User Management Routes."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.domain import Token, LoginRequest, UserResponse, UserCreate
from app.core.security import verify_password, create_access_token, hash_password
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password, returning JWT token with role information."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
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
    """Register a new real user account and issue an authentication JWT."""
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    workspace_id = request.workspace_id or settings.DEFAULT_WORKSPACE_ID
    import uuid
    new_user = User(
        id=f"usr-{uuid.uuid4().hex[:8]}",
        workspace_id=workspace_id,
        email=request.email,
        full_name=request.full_name,
        role=request.role,
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

@router.get("/users", response_model=List[UserResponse])
def list_demo_users(db: Session = Depends(get_db)):
    """List available users for easy role-switching during demonstrations."""
    users = db.query(User).filter(User.workspace_id == settings.DEFAULT_WORKSPACE_ID).all()
    return users

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Return user profile. Defaults to Creator if unauthenticated demo mode."""
    target_id = user_id or "usr-creator-01"
    user = db.query(User).filter(User.id == target_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
