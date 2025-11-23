"""
What it does: Traces table - stores complete agent execution runs
Each trace = one agent execution (e.g., "runner.run('question')")
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Trace(Base):
    __tablename__ = "traces"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trace_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)  # e.g., "ResearchAgent_run"
    status = Column(String, default="running")  # running, success, failed
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    
    # Timing
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=True)
    duration_ms = Column(Float, nullable=True)
    
    # Aggregated metrics from all spans
    total_tokens = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    
    # meta
    meta = Column(JSON, default={})  # Store ADK-specific data
    tags = Column(JSON, default=[])      # e.g., ["adk", "gemini", "a2a"]
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="traces")
    spans = relationship("Span", back_populates="trace", cascade="all, delete-orphan")
