"""
What it does: Trace/span operations (save agent execution data, query traces, calculate metrics)
"""
from sqlalchemy.orm import Session
from app.models.trace import Trace
from app.models.span import Span, LLMCall, ToolCall
from app.schemas.trace import TraceCreate, SpanCreate, LLMCallData, ToolCallData
from app.core.cost import calculate_cost
from uuid import UUID
from datetime import datetime

def create_trace(db: Session, project_id: UUID, trace_data: TraceCreate) -> Trace:
    """Create new trace record"""
    trace = Trace(
        trace_id=trace_data.trace_id,
        name=trace_data.name,
        status="running",
        project_id=project_id,
        start_time=trace_data.start_time,
        end_time=trace_data.end_time,
        metadata=trace_data.metadata,
        tags=trace_data.tags
    )
    
    if trace_data.end_time:
        trace.duration_ms = (trace_data.end_time - trace_data.start_time).total_seconds() * 1000
        trace.status = "success"
    
    db.add(trace)
    db.commit()
    db.refresh(trace)
    return trace

def create_span(db: Session, span_data: SpanCreate) -> Span:
    """Create new span record"""
    duration_ms = None
    if span_data.end_time:
        duration_ms = (span_data.end_time - span_data.start_time).total_seconds() * 1000
    
    span = Span(
        span_id=span_data.span_id,
        trace_id=span_data.trace_id,
        parent_span_id=span_data.parent_span_id,
        name=span_data.name,
        type=span_data.type,
        status="success" if span_data.end_time else "running",
        start_time=span_data.start_time,
        end_time=span_data.end_time,
        duration_ms=duration_ms,
        inputs=span_data.inputs,
        outputs=span_data.outputs,
        metadata=span_data.metadata,
        error=span_data.error
    )
    
    if span_data.error:
        span.status = "failed"
    
    db.add(span)
    db.commit()
    db.refresh(span)
    return span

def create_llm_call(db: Session, span_id: str, llm_data: LLMCallData) -> LLMCall:
    """Create LLM call record with cost calculation"""
    total_tokens = llm_data.input_tokens + llm_data.output_tokens
    cost = calculate_cost(llm_data.model_name, llm_data.input_tokens, llm_data.output_tokens)
    
    llm_call = LLMCall(
        span_id=span_id,
        model_name=llm_data.model_name,
        provider=llm_data.provider,
        input_tokens=llm_data.input_tokens,
        output_tokens=llm_data.output_tokens,
        total_tokens=total_tokens,
        cost=cost,
        prompt=llm_data.prompt,
        response=llm_data.response
    )
    db.add(llm_call)
    db.commit()
    return llm_call

def create_tool_call(db: Session, span_id: str, tool_data: ToolCallData) -> ToolCall:
    """Create tool call record"""
    tool_call = ToolCall(
        span_id=span_id,
        tool_name=tool_data.tool_name,
        tool_inputs=tool_data.tool_inputs,
        tool_outputs=tool_data.tool_outputs,
        error=tool_data.error
    )
    db.add(tool_call)
    db.commit()
    return tool_call

def get_traces(db: Session, project_id: UUID, skip: int = 0, limit: int = 50) -> list[Trace]:
    """Get paginated traces for project"""
    return db.query(Trace).filter(
        Trace.project_id == project_id
    ).order_by(Trace.created_at.desc()).offset(skip).limit(limit).all()

def get_trace_by_id(db: Session, trace_id: str) -> Trace | None:
    """Get single trace with all spans"""
    return db.query(Trace).filter(Trace.trace_id == trace_id).first()

def update_trace_metrics(db: Session, trace_id: str):
    """Update trace total tokens and cost from all spans"""
    trace = get_trace_by_id(db, trace_id)
    if not trace:
        return
    
    # Sum up tokens and costs from all LLM calls
    total_tokens = 0
    total_cost = 0.0
    
    for span in trace.spans:
        if span.llm_call:
            total_tokens += span.llm_call.total_tokens
            total_cost += span.llm_call.cost
    
    trace.total_tokens = total_tokens
    trace.total_cost = total_cost
    
    # Mark complete if all spans are done
    all_complete = all(span.end_time is not None for span in trace.spans)
    if all_complete and not trace.end_time:
        trace.end_time = datetime.utcnow()
        trace.duration_ms = (trace.end_time - trace.start_time).total_seconds() * 1000
        trace.status = "success"
    
    db.commit()
