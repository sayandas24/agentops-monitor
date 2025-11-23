# What it does: Handles current trace and span; ensures spans stack properly

import threading

# Use a global dict with thread ID as key to support multi-threaded execution
_global_context = {}

# Use a single global trace context (not thread-specific)
# This works because we typically only have one trace active at a time
_current_trace_id = None

def set_trace(trace):
    global _current_trace_id
    _current_trace_id = trace['trace_id']
    _global_context[_current_trace_id] = {
        'trace': trace,
        'spans': [],
        'llm_calls': {},
        'tool_calls': {}
    }

def get_trace():
    if _current_trace_id and _current_trace_id in _global_context:
        return _global_context[_current_trace_id]['trace']
    return None

def set_spans(spans):
    if _current_trace_id and _current_trace_id in _global_context:
        _global_context[_current_trace_id]['spans'] = spans

def get_spans():
    if _current_trace_id and _current_trace_id in _global_context:
        return _global_context[_current_trace_id]['spans']
    return []

def set_calls(llm_calls, tool_calls):
    if _current_trace_id and _current_trace_id in _global_context:
        _global_context[_current_trace_id]['llm_calls'] = llm_calls
        _global_context[_current_trace_id]['tool_calls'] = tool_calls

def get_calls():
    if _current_trace_id and _current_trace_id in _global_context:
        ctx = _global_context[_current_trace_id]
        return (ctx['llm_calls'], ctx['tool_calls'])
    return ({}, {})

def add_llm_call_to_context(span_id, llm_data):
    """Add an LLM call to the current context"""
    llm_calls, _ = get_calls()
    llm_calls[span_id] = llm_data

def add_tool_call_to_context(span_id, tool_data):
    """Add a tool call to the current context"""
    _, tool_calls = get_calls()
    tool_calls[span_id] = tool_data
