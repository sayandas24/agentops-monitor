"""
What it does: Defines formats for trace/span data from SDK
"""

from pydantic import BaseModel, field_serializer
from typing import Dict, List, Optional
from datetime import datetime
from uuid import UUID


class SpanCreate(BaseModel):
    span_id: str
    trace_id: str
    parent_span_id: Optional[str] = None
    name: str
    type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    inputs: Dict = {}
    outputs: Dict = {}
    meta: Dict = {}
    error: Optional[str] = None


class LLMCallData(BaseModel):
    model_name: str
    provider: str
    input_tokens: int = 0
    output_tokens: int = 0
    prompt: Optional[str] = None
    response: Optional[str] = None


class ToolCallData(BaseModel):
    tool_name: str
    tool_inputs: Dict = {}
    tool_outputs: Dict = {}
    error: Optional[str] = None


class TraceCreate(BaseModel):
    trace_id: str
    name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    meta: Dict = {}
    tags: List[str] = []


class TraceIngest(BaseModel):
    """Main payload from SDK"""

    api_key: str
    trace: TraceCreate
    spans: List[SpanCreate] = []
    llm_calls: Dict[str, LLMCallData] = {}
    tool_calls: Dict[str, ToolCallData] = {}


class TraceResponse(BaseModel):
    id: UUID
    trace_id: str
    name: str
    status: str
    start_time: datetime
    end_time: Optional[datetime]
    duration_ms: Optional[float]
    total_tokens: int
    total_cost: float
    meta: Dict
    tags: List[str]

    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True
