"""
What it does: Defines formats for creating/viewing projects
"""
from pydantic import BaseModel
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str | None
    api_key: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
