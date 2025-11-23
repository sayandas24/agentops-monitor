"""
Analytics schemas for request/response validation
"""
from pydantic import BaseModel, field_serializer
from typing import List, Optional
from datetime import datetime
from uuid import UUID


class AnalyticsQueryParams(BaseModel):
    """Query parameters for analytics endpoints"""
    time_range: Optional[str] = "all_time"  # last_24h, last_7d, last_30d, all_time
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    project_ids: Optional[List[str]] = None


class AnalyticsSummaryResponse(BaseModel):
    """Aggregated summary metrics"""
    total_traces: int
    total_llm_calls: int
    total_tool_calls: int
    total_input_tokens: int
    total_output_tokens: int
    total_tokens: int
    total_cost: float
    avg_duration_ms: float
    min_duration_ms: float
    max_duration_ms: float
    total_duration_ms: float
    unique_projects: int


class TrendDataPoint(BaseModel):
    """Single data point in time series"""
    timestamp: datetime
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost: float
    trace_count: int


class TrendsResponse(BaseModel):
    """Time series data with granularity"""
    data: List[TrendDataPoint]
    granularity: str  # "hour", "day", "week"


class ModelBreakdownItem(BaseModel):
    """Cost and usage breakdown for a single model"""
    model_name: str
    provider: str
    total_cost: float
    cost_percentage: float
    input_tokens: int
    output_tokens: int
    total_tokens: int
    call_count: int


class ModelsResponse(BaseModel):
    """List of model breakdowns"""
    models: List[ModelBreakdownItem]


class TopTraceItem(BaseModel):
    """High-usage trace information"""
    trace_id: str
    name: str
    total_tokens: int
    total_cost: float
    duration_ms: float
    llm_call_count: int
    start_time: datetime
    project_name: str
    status: str


class TopTracesResponse(BaseModel):
    """List of top traces"""
    traces: List[TopTraceItem]
