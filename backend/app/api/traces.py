"""
What it does: Trace endpoints - ingest data from SDK, get traces for dashboard
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.schemas.trace import TraceIngest, TraceResponse
from app.crud import project as project_crud
from app.crud import trace as trace_crud
from app.config import settings

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/traces", tags=["traces"])


@router.post("/ingest")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
def ingest_trace(request: Request, data: TraceIngest, db: Session = Depends(get_db)):
    """
    Ingest trace data from SDK
    Called by: SDK when agent executes
    """
    logger.info(f"Receiving trace ingest from {request.client.host}")
    
    # Validate API key
    project = project_crud.get_project_by_api_key(db, data.api_key)
    if not project:
        logger.warning(f"Invalid API key attempt from {request.client.host}")
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    logger.info(f"Ingesting trace {data.trace.trace_id} for project {project.id}")
    
    # Create trace
    trace = trace_crud.create_trace(db, project.id, data.trace)
    
    # Create spans
    for span_data in data.spans:
        span = trace_crud.create_span(db, span_data)
        
        # Create LLM call if exists
        if span_data.span_id in data.llm_calls:
            trace_crud.create_llm_call(db, span_data.span_id, data.llm_calls[span_data.span_id])
        
        # Create tool call if exists
        if span_data.span_id in data.tool_calls:
            trace_crud.create_tool_call(db, span_data.span_id, data.tool_calls[span_data.span_id])
    
    # Update trace metrics (sum tokens, costs)
    trace_crud.update_trace_metrics(db, data.trace.trace_id)
    
    logger.info(f"Successfully ingested trace {trace.trace_id}")
    return {"success": True, "trace_id": trace.trace_id}


@router.get("/{project_id}", response_model=list[TraceResponse])
def get_traces(project_id: str, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Get traces for project (for dashboard)"""
    from uuid import UUID
    return trace_crud.get_traces(db, UUID(project_id), skip, limit)

@router.get("/detail/{trace_id}")
def get_trace_detail(trace_id: str, db: Session = Depends(get_db)):
    """Get single trace with all spans (for trace detail page)"""
    trace = trace_crud.get_trace_by_id(db, trace_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
    
    return {
        "trace": trace,
        "spans": trace.spans
    }
