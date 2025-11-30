"""
Analytics CRUD operations - aggregation queries for dashboard metrics
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_
from app.models.trace import Trace
from app.models.span import Span, LLMCall, ToolCall
from app.models.project import Project
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from uuid import UUID


def _get_time_filter(time_range: str, start_date: Optional[datetime], end_date: Optional[datetime]) -> Optional[any]:
    """
    Generate time filter based on time_range or custom dates
    Returns SQLAlchemy filter condition
    """
    if time_range == "custom" and start_date and end_date:
        return and_(Trace.start_time >= start_date, Trace.start_time <= end_date)
    
    now = datetime.utcnow()
    
    if time_range == "last_24h":
        cutoff = now - timedelta(hours=24)
        return Trace.start_time >= cutoff
    elif time_range == "last_7d":
        cutoff = now - timedelta(days=7)
        return Trace.start_time >= cutoff
    elif time_range == "last_30d":
        cutoff = now - timedelta(days=30)
        return Trace.start_time >= cutoff
    elif time_range == "this_year":
        # Get traces from start of current year to now
        year_start = datetime(now.year, 1, 1)
        return Trace.start_time >= year_start
    
    return None


def _get_project_filter(project_ids: Optional[List[str]]) -> Optional[any]:
    """Generate project filter condition"""
    if not project_ids:
        return None
    
    # Convert string IDs to UUIDs
    try:
        uuid_list = [UUID(pid) for pid in project_ids]
        return Trace.project_id.in_(uuid_list)
    except (ValueError, AttributeError):
        return None


def _determine_granularity(time_range: str, start_date: Optional[datetime], end_date: Optional[datetime]) -> str:
    """Determine appropriate time granularity for trends"""
    if time_range == "last_24h":
        return "hour"
    elif time_range == "last_7d":
        return "day"
    elif time_range == "last_30d":
        return "day"
    elif time_range == "this_year":
        return "day"
    elif time_range == "custom" and start_date and end_date:
        delta = end_date - start_date
        if delta.days <= 2:
            return "hour"
        elif delta.days <= 90:
            return "day"
        else:
            return "week"
    else:
        return "day"


def get_analytics_summary(
    db: Session,
    time_range: str = "all_time",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[List[str]] = None
) -> dict:
    """
    Get aggregated summary metrics
    """
    # Build filters
    filters = []
    
    time_filter = _get_time_filter(time_range, start_date, end_date)
    if time_filter is not None:
        filters.append(time_filter)
    
    project_filter = _get_project_filter(project_ids)
    if project_filter is not None:
        filters.append(project_filter)
    
    # Main aggregation query
    query = db.query(
        func.count(func.distinct(Trace.id)).label('total_traces'),
        func.count(func.distinct(case((Span.type == 'llm_call', Span.id)))).label('total_llm_calls'),
        func.count(func.distinct(case((Span.type == 'tool_call', Span.id)))).label('total_tool_calls'),
        func.coalesce(func.sum(LLMCall.input_tokens), 0).label('total_input_tokens'),
        func.coalesce(func.sum(LLMCall.output_tokens), 0).label('total_output_tokens'),
        func.coalesce(func.sum(LLMCall.total_tokens), 0).label('total_tokens'),
        func.coalesce(func.sum(LLMCall.cost), 0.0).label('total_cost'),
        func.coalesce(func.avg(Trace.duration_ms), 0.0).label('avg_duration_ms'),
        func.coalesce(func.min(Trace.duration_ms), 0.0).label('min_duration_ms'),
        func.coalesce(func.max(Trace.duration_ms), 0.0).label('max_duration_ms'),
        func.coalesce(func.sum(Trace.duration_ms), 0.0).label('total_duration_ms'),
        func.count(func.distinct(Trace.project_id)).label('unique_projects')
    ).select_from(Trace)\
     .outerjoin(Span, Trace.trace_id == Span.trace_id)\
     .outerjoin(LLMCall, Span.span_id == LLMCall.span_id)
    
    # Apply filters
    if filters:
        query = query.filter(and_(*filters))
    
    result = query.first()
    
    return {
        "total_traces": result.total_traces or 0,
        "total_llm_calls": result.total_llm_calls or 0,
        "total_tool_calls": result.total_tool_calls or 0,
        "total_input_tokens": int(result.total_input_tokens or 0),
        "total_output_tokens": int(result.total_output_tokens or 0),
        "total_tokens": int(result.total_tokens or 0),
        "total_cost": float(result.total_cost or 0.0),
        "avg_duration_ms": float(result.avg_duration_ms or 0.0),
        "min_duration_ms": float(result.min_duration_ms or 0.0),
        "max_duration_ms": float(result.max_duration_ms or 0.0),
        "total_duration_ms": float(result.total_duration_ms or 0.0),
        "unique_projects": result.unique_projects or 0
    }


def get_analytics_trends(
    db: Session,
    time_range: str = "all_time",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[List[str]] = None
) -> Tuple[List[dict], str]:
    """
    Get time-series data for trends
    Returns (data_points, granularity)
    """
    # Determine granularity
    granularity = _determine_granularity(time_range, start_date, end_date)
    
    # Build filters
    filters = []
    
    time_filter = _get_time_filter(time_range, start_date, end_date)
    if time_filter is not None:
        filters.append(time_filter)
    
    project_filter = _get_project_filter(project_ids)
    if project_filter is not None:
        filters.append(project_filter)
    
    # Query with time bucketing
    query = db.query(
        func.date_trunc(granularity, Trace.start_time).label('timestamp'),
        func.coalesce(func.sum(LLMCall.input_tokens), 0).label('input_tokens'),
        func.coalesce(func.sum(LLMCall.output_tokens), 0).label('output_tokens'),
        func.coalesce(func.sum(LLMCall.total_tokens), 0).label('total_tokens'),
        func.coalesce(func.sum(LLMCall.cost), 0.0).label('cost'),
        func.count(func.distinct(Trace.id)).label('trace_count')
    ).select_from(Trace)\
     .outerjoin(Span, Trace.trace_id == Span.trace_id)\
     .outerjoin(LLMCall, Span.span_id == LLMCall.span_id)
    
    # Apply filters
    if filters:
        query = query.filter(and_(*filters))
    
    # Group by time bucket and order
    query = query.group_by(func.date_trunc(granularity, Trace.start_time))\
                 .order_by(func.date_trunc(granularity, Trace.start_time))
    
    results = query.all()
    
    data_points = [
        {
            "timestamp": row.timestamp,
            "input_tokens": int(row.input_tokens or 0),
            "output_tokens": int(row.output_tokens or 0),
            "total_tokens": int(row.total_tokens or 0),
            "cost": float(row.cost or 0.0),
            "trace_count": row.trace_count or 0
        }
        for row in results
    ]
    
    return data_points, granularity


def get_model_breakdown(
    db: Session,
    time_range: str = "all_time",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[List[str]] = None
) -> List[dict]:
    """
    Get cost and usage breakdown by LLM model
    """
    # Build filters
    filters = []
    
    time_filter = _get_time_filter(time_range, start_date, end_date)
    if time_filter is not None:
        filters.append(time_filter)
    
    project_filter = _get_project_filter(project_ids)
    if project_filter is not None:
        filters.append(project_filter)
    
    # Query model breakdown
    query = db.query(
        LLMCall.model_name,
        LLMCall.provider,
        func.sum(LLMCall.cost).label('total_cost'),
        func.sum(LLMCall.input_tokens).label('input_tokens'),
        func.sum(LLMCall.output_tokens).label('output_tokens'),
        func.sum(LLMCall.total_tokens).label('total_tokens'),
        func.count(LLMCall.id).label('call_count')
    ).select_from(LLMCall)\
     .join(Span, LLMCall.span_id == Span.span_id)\
     .join(Trace, Span.trace_id == Trace.trace_id)
    
    # Apply filters
    if filters:
        query = query.filter(and_(*filters))
    
    # Group and order
    query = query.group_by(LLMCall.model_name, LLMCall.provider)\
                 .order_by(func.sum(LLMCall.cost).desc())
    
    results = query.all()
    
    # Calculate total cost for percentages
    total_cost = sum(row.total_cost or 0.0 for row in results)
    
    models = [
        {
            "model_name": row.model_name,
            "provider": row.provider,
            "total_cost": float(row.total_cost or 0.0),
            "cost_percentage": float((row.total_cost or 0.0) / total_cost * 100) if total_cost > 0 else 0.0,
            "input_tokens": int(row.input_tokens or 0),
            "output_tokens": int(row.output_tokens or 0),
            "total_tokens": int(row.total_tokens or 0),
            "call_count": row.call_count or 0
        }
        for row in results
    ]
    
    return models


def get_top_traces(
    db: Session,
    time_range: str = "all_time",
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[List[str]] = None,
    limit: int = 10,
    sort_by: str = "tokens"
) -> List[dict]:
    """
    Get top traces by usage
    sort_by: "tokens", "cost", or "duration"
    """
    # Build filters
    filters = []
    
    time_filter = _get_time_filter(time_range, start_date, end_date)
    if time_filter is not None:
        filters.append(time_filter)
    
    project_filter = _get_project_filter(project_ids)
    if project_filter is not None:
        filters.append(project_filter)
    
    # Subquery for LLM call counts
    llm_count_subq = db.query(
        Span.trace_id,
        func.count(LLMCall.id).label('llm_call_count')
    ).select_from(Span)\
     .outerjoin(LLMCall, Span.span_id == LLMCall.span_id)\
     .group_by(Span.trace_id)\
     .subquery()
    
    # Main query
    query = db.query(
        Trace.trace_id,
        Trace.name,
        Trace.total_tokens,
        Trace.total_cost,
        Trace.duration_ms,
        func.coalesce(llm_count_subq.c.llm_call_count, 0).label('llm_call_count'),
        Trace.start_time,
        Project.name.label('project_name'),
        Trace.status
    ).select_from(Trace)\
     .join(Project, Trace.project_id == Project.id)\
     .outerjoin(llm_count_subq, Trace.trace_id == llm_count_subq.c.trace_id)
    
    # Apply filters
    if filters:
        query = query.filter(and_(*filters))
    
    # Sort by requested field
    if sort_by == "cost":
        query = query.order_by(Trace.total_cost.desc())
    elif sort_by == "duration":
        query = query.order_by(Trace.duration_ms.desc())
    else:  # default to tokens
        query = query.order_by(Trace.total_tokens.desc())
    
    # Limit results
    query = query.limit(limit)
    
    results = query.all()
    
    traces = [
        {
            "trace_id": row.trace_id,
            "name": row.name,
            "total_tokens": row.total_tokens or 0,
            "total_cost": float(row.total_cost or 0.0),
            "duration_ms": float(row.duration_ms or 0.0),
            "llm_call_count": row.llm_call_count or 0,
            "start_time": row.start_time,
            "project_name": row.project_name,
            "status": row.status
        }
        for row in results
    ]
    
    return traces
