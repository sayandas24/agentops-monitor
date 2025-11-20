"""
What it does: Project operations (create project, generate API keys, etc.)
"""
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate
from uuid import UUID
import secrets

def generate_api_key() -> str:
    """Generate unique API key for project"""
    return f"agentops_{secrets.token_urlsafe(32)}"

def create_project(db: Session, project: ProjectCreate, owner_id: UUID) -> Project:
    """Create new project with API key"""
    db_project = Project(
        name=project.name,
        description=project.description,
        api_key=generate_api_key(),
        owner_id=owner_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project_by_api_key(db: Session, api_key: str) -> Project | None:
    """Find project by API key (used by SDK)"""
    return db.query(Project).filter(Project.api_key == api_key).first()

def get_user_projects(db: Session, user_id: UUID) -> list[Project]:
    """Get all projects owned by user"""
    return db.query(Project).filter(Project.owner_id == user_id).all()
