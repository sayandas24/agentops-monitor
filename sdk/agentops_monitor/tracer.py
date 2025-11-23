"""
What it does:
    Creates unique trace_id and span_ids

    Collects start/end times, calculates duration

    Handles meta fields (not metadata)
"""

import uuid
from datetime import datetime
from .context import (
    set_trace, set_spans, get_spans, set_calls, get_calls, get_trace,
    add_llm_call_to_context, add_tool_call_to_context
)


def new_trace(name, meta, tags=None):
    trace_id = f"trace_{uuid.uuid4().hex[:16]}"
    trace = {
        "trace_id": trace_id,
        "name": name,
        "start_time": datetime.utcnow().isoformat(),
        "meta": meta or {},
        "tags": tags or [],
    }
    set_trace(trace)
    set_spans([])
    set_calls({}, {})
    return trace


def end_trace(end_time=None, meta=None):
    trace = get_trace()
    if end_time:
        trace["end_time"] = end_time.isoformat()
    else:
        trace["end_time"] = datetime.utcnow().isoformat()
    if meta:
        trace["meta"].update(meta)
    
    # Get all collected data
    spans = get_spans()
    llm_calls, tool_calls = get_calls()
    
    return trace, spans, llm_calls, tool_calls


def add_span(
    name, type, meta, parent_span_id=None, inputs=None, outputs=None, error=None
):
    # Check if trace exists, if not return None (monitoring not active)
    trace = get_trace()
    if not trace:
        return None
    
    span_id = f"span_{uuid.uuid4().hex[:16]}"
    span = {
        "span_id": span_id,
        "trace_id": trace["trace_id"],
        "parent_span_id": parent_span_id,
        "name": name,
        "type": type,
        "start_time": datetime.utcnow().isoformat(),
        "inputs": inputs or {},
        "outputs": outputs or {},
        "meta": meta or {},
        "error": error,
    }
    spans = get_spans()
    spans.append(span)
    set_spans(spans)
    return span_id


def end_span(span_id, outputs=None, error=None, meta=None):
    # If span_id is None, monitoring wasn't active when span was created
    if not span_id:
        return
    
    spans = get_spans()
    for span in spans:
        if span["span_id"] == span_id:
            span["end_time"] = datetime.utcnow().isoformat()
            if outputs:
                span["outputs"] = outputs
            if meta:
                span["meta"].update(meta)
            if error:
                span["error"] = error
            break


def add_llm_call(span_id, model_name, provider, prompt=None, response=None, 
                 input_tokens=0, output_tokens=0):
    """Create an LLM call record associated with a span"""
    if not span_id:
        return
    
    llm_data = {
        "model_name": model_name,
        "provider": provider,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "prompt": prompt,
        "response": response,
    }
    add_llm_call_to_context(span_id, llm_data)


def add_tool_call(span_id, tool_name, tool_inputs, tool_outputs=None, error=None):
    """Create a tool call record associated with a span"""
    if not span_id:
        return
    
    tool_data = {
        "tool_name": tool_name,
        "tool_inputs": tool_inputs,
        "tool_outputs": tool_outputs or {},
        "error": error,
    }
    add_tool_call_to_context(span_id, tool_data)
