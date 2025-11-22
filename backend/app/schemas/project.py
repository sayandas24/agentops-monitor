"""
What it does: Defines formats for creating/viewing projects
"""
from pydantic import BaseModel, field_serializer
from datetime import datetime
from uuid import UUID

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None

class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    api_key: str
    is_active: bool
    created_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True
