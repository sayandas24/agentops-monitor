"""
What it does: User database operations (create user, find by email, etc.)
"""

from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import UserCreate
from app.core.security import hash_password
from uuid import UUID


def create_user(db: Session, user: UserCreate) -> User:
    """Create new user account"""
    print("***raw user data***", user)

    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        full_name=user.full_name,
    )
    print("***user data received***", db_user)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str) -> User | None:
    """Find user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    """Find user by ID"""
    return db.query(User).filter(User.id == user_id).first()
