# What it does: Captures tool usage throughout agent runs

from google.adk.tools import BaseTool

def wrap_tool(tool):
    """
    Wrap a Google ADK tool to capture its execution.
    Note: Google ADK tools are called via their 'run' method, not __call__
    """
    # Check if tool has a 'run' method (Google ADK pattern)
    if hasattr(tool, 'run'):
        original_run = tool.run
        
        def wrapped_run(*args, **kwargs):
            from ..tracer import add_span, end_span, add_tool_call
            
            tool_name = getattr(tool, 'name', tool.__class__.__name__)
            tool_inputs = {"args": str(args)[:500], "kwargs": str(kwargs)[:500]}
            
            span_id = add_span(
                name=tool_name,
                type="tool_call",
                meta={},
                inputs=tool_inputs
            )
            
            try:
                result = original_run(*args, **kwargs)
                
                # Create tool call record
                add_tool_call(
                    span_id=span_id,
                    tool_name=tool_name,
                    tool_inputs=tool_inputs,
                    tool_outputs={"result": str(result)[:1000]}
                )
                
                end_span(span_id, outputs={"result": str(result)[:500]})
                return result
            except Exception as e:
                # Create tool call record with error
                add_tool_call(
                    span_id=span_id,
                    tool_name=tool_name,
                    tool_inputs=tool_inputs,
                    error=str(e)
                )
                
                end_span(span_id, error=str(e))
                raise
        
        tool.run = wrapped_run
    
    # Also try __call__ for other tool types
    elif hasattr(tool, '__call__'):
        original_call = tool.__call__
        
        def wrapped_call(*args, **kwargs):
            from ..tracer import add_span, end_span, add_tool_call
            
            tool_name = getattr(tool, 'name', tool.__class__.__name__)
            tool_inputs = {"args": str(args)[:500], "kwargs": str(kwargs)[:500]}
            
            span_id = add_span(
                name=tool_name,
                type="tool_call",
                meta={},
                inputs=tool_inputs
            )
            
            try:
                result = original_call(*args, **kwargs)
                
                # Create tool call record
                add_tool_call(
                    span_id=span_id,
                    tool_name=tool_name,
                    tool_inputs=tool_inputs,
                    tool_outputs={"result": str(result)[:1000]}
                )
                
                end_span(span_id, outputs={"result": str(result)[:500]})
                return result
            except Exception as e:
                # Create tool call record with error
                add_tool_call(
                    span_id=span_id,
                    tool_name=tool_name,
                    tool_inputs=tool_inputs,
                    error=str(e)
                )
                
                end_span(span_id, error=str(e))
                raise
        
        tool.__call__ = wrapped_call
    
    return tool
