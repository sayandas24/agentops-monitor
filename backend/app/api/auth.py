"""
What it does: Authentication endpoints - signup, login, get JWT tokens
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from app.crud import user as user_crud
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register new user account"""
    # Check if email already exists
    existing = user_crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    db_user = user_crud.create_user(db, user)
    return db_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get JWT token"""
    # Find user
    user = user_crud.get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create JWT token
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token}
