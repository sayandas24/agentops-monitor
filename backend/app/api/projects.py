"""
What it does: Project endpoints - create projects, list projects, get API keys
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.project import ProjectCreate, ProjectResponse
from app.crud import project as project_crud
from app.core.security import decode_token
from uuid import UUID

router = APIRouter(prefix="/projects", tags=["projects"])

def get_current_user_id(authorization: str = Header(...)) -> UUID:
    """Extract user ID from JWT token in Authorization header"""
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return UUID(payload["sub"])

@router.post("", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """Create new project and generate API key"""
    return project_crud.create_project(db, project, user_id)

@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    """List all user's projects"""
    return project_crud.get_user_projects(db, user_id)
