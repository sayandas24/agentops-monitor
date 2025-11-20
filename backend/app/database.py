# What it does: Connects FastAPI to Supabase PostgreSQL database

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Connect to Supabase
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Check connection health
    pool_size=10,  # Connection pool
    max_overflow=20,
    # connect_args={"options": "-c client_encoding=utf8", "connect_timeout": 10},
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Dependency for routes
def get_db():
    """Provides database session to API endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
