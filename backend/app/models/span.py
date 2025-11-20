"""
What it does:
- Spans table: Individual steps within a trace (LLM call, tool call, reasoning)
- LLMCall table: Details of LLM API calls (Gemini, GPT, etc.)
- ToolCall table: Details of tool executions (google_search, calculator, etc.)
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base


class Span(Base):
    __tablename__ = "spans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    span_id = Column(String, unique=True, index=True, nullable=False)
    trace_id = Column(String, ForeignKey("traces.trace_id"), nullable=False)
    parent_span_id = Column(String, nullable=True)  # For nested spans

    # Basic info
    name = Column(String, nullable=False)
    type = Column(
        String, nullable=False
    )  # "llm_call", "tool_call", "agent_step", "a2a_message"
    status = Column(String, default="running")

    # Timing
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    duration_ms = Column(Float, nullable=True)

    # Data
    inputs = Column(JSON, default={})
    outputs = Column(JSON, default={})
    metadata = Column(JSON, default={})  # Store ADK/A2A specific metadata
    error = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    trace = relationship("Trace", back_populates="spans")
    llm_call = relationship(
        "LLMCall", back_populates="span", uselist=False, cascade="all, delete-orphan"
    )
    tool_call = relationship(
        "ToolCall", back_populates="span", uselist=False, cascade="all, delete-orphan"
    )


class LLMCall(Base):
    __tablename__ = "llm_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    span_id = Column(String, ForeignKey("spans.span_id"), nullable=False)

    # Model info
    model_name = Column(String, nullable=False)  # e.g., "gemini-2.0-flash"
    provider = Column(String, nullable=False)  # e.g., "google", "openai"

    # Token usage
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)

    # Cost (auto-calculated)
    cost = Column(Float, default=0.0)

    # Content (optional, can be disabled for privacy)
    prompt = Column(Text, nullable=True)
    response = Column(Text, nullable=True)

    # Relationships
    span = relationship("Span", back_populates="llm_call")


class ToolCall(Base):
    __tablename__ = "tool_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    span_id = Column(String, ForeignKey("spans.span_id"), nullable=False)

    tool_name = Column(String, nullable=False)  # e.g., "google_search", "calculator"
    tool_inputs = Column(JSON, default={})
    tool_outputs = Column(JSON, default={})
    error = Column(Text, nullable=True)

    # Relationships
    span = relationship("Span", back_populates="tool_call")
