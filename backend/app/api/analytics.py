"""
Analytics API endpoints - aggregated metrics and insights
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    TrendsResponse,
    ModelsResponse,
    TopTracesResponse
)
from app.crud import analytics as analytics_crud
from typing import Optional, List
from datetime import datetime
import csv
import json
import io

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    time_range: str = Query("this_year", regex="^(last_24h|last_7d|last_30d|this_year|custom)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[str] = None,  # Comma-separated project IDs
    db: Session = Depends(get_db)
):
    """
    Get aggregated analytics summary
    
    Query params:
    - time_range: last_24h, last_7d, last_30d, this_year, custom
    - start_date: ISO datetime (required if time_range=custom)
    - end_date: ISO datetime (required if time_range=custom)
    - project_ids: Comma-separated project UUIDs
    """
    try:
        # Parse project IDs
        project_id_list = None
        if project_ids:
            project_id_list = [pid.strip() for pid in project_ids.split(",")]
        
        # Validate custom date range
        if time_range == "custom" and (not start_date or not end_date):
            raise HTTPException(
                status_code=400,
                detail="start_date and end_date are required when time_range is 'custom'"
            )
        
        summary = analytics_crud.get_analytics_summary(
            db=db,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            project_ids=project_id_list
        )
        
        return summary
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/trends", response_model=TrendsResponse)
def get_analytics_trends(
    time_range: str = Query("this_year", regex="^(last_24h|last_7d|last_30d|this_year|custom)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get time-series trend data
    
    Returns data points grouped by appropriate time granularity
    """
    try:
        # Parse project IDs
        project_id_list = None
        if project_ids:
            project_id_list = [pid.strip() for pid in project_ids.split(",")]
        
        # Validate custom date range
        if time_range == "custom" and (not start_date or not end_date):
            raise HTTPException(
                status_code=400,
                detail="start_date and end_date are required when time_range is 'custom'"
            )
        
        data_points, granularity = analytics_crud.get_analytics_trends(
            db=db,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            project_ids=project_id_list
        )
        
        return {
            "data": data_points,
            "granularity": granularity
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/models", response_model=ModelsResponse)
def get_model_breakdown(
    time_range: str = Query("this_year", regex="^(last_24h|last_7d|last_30d|this_year|custom)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get cost and usage breakdown by LLM model
    """
    try:
        # Parse project IDs
        project_id_list = None
        if project_ids:
            project_id_list = [pid.strip() for pid in project_ids.split(",")]
        
        # Validate custom date range
        if time_range == "custom" and (not start_date or not end_date):
            raise HTTPException(
                status_code=400,
                detail="start_date and end_date are required when time_range is 'custom'"
            )
        
        models = analytics_crud.get_model_breakdown(
            db=db,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            project_ids=project_id_list
        )
        
        return {"models": models}
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/top-traces", response_model=TopTracesResponse)
def get_top_traces(
    time_range: str = Query("this_year", regex="^(last_24h|last_7d|last_30d|this_year|custom)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("tokens", regex="^(tokens|cost|duration)$"),
    db: Session = Depends(get_db)
):
    """
    Get top traces by usage
    
    Query params:
    - limit: Number of traces to return (1-100, default 10)
    - sort_by: Sort field (tokens, cost, duration)
    """
    try:
        # Parse project IDs
        project_id_list = None
        if project_ids:
            project_id_list = [pid.strip() for pid in project_ids.split(",")]
        
        # Validate custom date range
        if time_range == "custom" and (not start_date or not end_date):
            raise HTTPException(
                status_code=400,
                detail="start_date and end_date are required when time_range is 'custom'"
            )
        
        traces = analytics_crud.get_top_traces(
            db=db,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            project_ids=project_id_list,
            limit=limit,
            sort_by=sort_by
        )
        
        return {"traces": traces}
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/export")
def export_analytics(
    format: str = Query("csv", regex="^(csv|json)$"),
    time_range: str = Query("this_year", regex="^(last_24h|last_7d|last_30d|this_year|custom)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    project_ids: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Export analytics data in CSV or JSON format
    """
    try:
        # Parse project IDs
        project_id_list = None
        if project_ids:
            project_id_list = [pid.strip() for pid in project_ids.split(",")]
        
        # Validate custom date range
        if time_range == "custom" and (not start_date or not end_date):
            raise HTTPException(
                status_code=400,
                detail="start_date and end_date are required when time_range is 'custom'"
            )
        
        # Get all data
        summary = analytics_crud.get_analytics_summary(
            db=db,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            project_ids=project_id_list
        )
        
        trends_data, granularity = analytics_crud.get_analytics_trends(
            db=db,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            project_ids=project_id_list
        )
        
        models = analytics_crud.get_model_breakdown(
            db=db,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            project_ids=project_id_list
        )
        
        top_traces = analytics_crud.get_top_traces(
            db=db,
            time_range=time_range,
            start_date=start_date,
            end_date=end_date,
            project_ids=project_id_list,
            limit=50
        )
        
        # Generate timestamp for filename
        timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
        
        if format == "json":
            # Export as JSON
            export_data = {
                "exported_at": datetime.utcnow().isoformat(),
                "filters": {
                    "time_range": time_range,
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None,
                    "project_ids": project_id_list
                },
                "summary": summary,
                "trends": {
                    "granularity": granularity,
                    "data": trends_data
                },
                "models": models,
                "top_traces": top_traces
            }
            
            json_str = json.dumps(export_data, indent=2, default=str)
            
            return StreamingResponse(
                io.BytesIO(json_str.encode()),
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename=analytics-{timestamp}.json"
                }
            )
        
        else:  # CSV format
            # Create CSV with summary data
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Summary section
            writer.writerow(["Analytics Summary"])
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Total Traces", summary["total_traces"]])
            writer.writerow(["Total LLM Calls", summary["total_llm_calls"]])
            writer.writerow(["Total Tool Calls", summary["total_tool_calls"]])
            writer.writerow(["Total Input Tokens", summary["total_input_tokens"]])
            writer.writerow(["Total Output Tokens", summary["total_output_tokens"]])
            writer.writerow(["Total Tokens", summary["total_tokens"]])
            writer.writerow(["Total Cost ($)", summary["total_cost"]])
            writer.writerow(["Avg Duration (ms)", summary["avg_duration_ms"]])
            writer.writerow(["Min Duration (ms)", summary["min_duration_ms"]])
            writer.writerow(["Max Duration (ms)", summary["max_duration_ms"]])
            writer.writerow(["Total Duration (ms)", summary["total_duration_ms"]])
            writer.writerow(["Unique Projects", summary["unique_projects"]])
            writer.writerow([])
            
            # Model breakdown section
            writer.writerow(["Model Breakdown"])
            writer.writerow(["Model", "Provider", "Cost", "Cost %", "Input Tokens", "Output Tokens", "Total Tokens", "Calls"])
            for model in models:
                writer.writerow([
                    model["model_name"],
                    model["provider"],
                    model["total_cost"],
                    model["cost_percentage"],
                    model["input_tokens"],
                    model["output_tokens"],
                    model["total_tokens"],
                    model["call_count"]
                ])
            writer.writerow([])
            
            # Top traces section
            writer.writerow(["Top Traces"])
            writer.writerow(["Trace ID", "Name", "Tokens", "Cost", "Duration (ms)", "LLM Calls", "Start Time", "Project", "Status"])
            for trace in top_traces:
                writer.writerow([
                    trace["trace_id"],
                    trace["name"],
                    trace["total_tokens"],
                    trace["total_cost"],
                    trace["duration_ms"],
                    trace["llm_call_count"],
                    trace["start_time"],
                    trace["project_name"],
                    trace["status"]
                ])
            
            csv_content = output.getvalue()
            
            return StreamingResponse(
                io.BytesIO(csv_content.encode()),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=analytics-{timestamp}.csv"
                }
            )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
