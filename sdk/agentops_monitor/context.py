# What it does: Handles current trace and span; ensures spans stack properly

import threading

_context = threading.local()

def set_trace(trace):
    _context.trace = trace

def get_trace():
    return getattr(_context, 'trace', None)

def set_spans(spans):
    _context.spans = spans

def get_spans():
    return getattr(_context, 'spans', [])

def set_calls(llm_calls, tool_calls):
    _context.llm_calls = llm_calls
    _context.tool_calls = tool_calls

def get_calls():
    return (
        getattr(_context, 'llm_calls', {}),
        getattr(_context, 'tool_calls', {}),
    )
