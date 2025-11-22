# What it does: Captures tool usage throughout agent runs

from google.adk.tools import BaseTool

def wrap_tool(tool):
    original_call = tool.__call__

    def wrapped_call(*args, **kwargs):
        from ..tracer import add_span, end_span
        span_id = add_span(
            name=tool.name,
            type="tool_call",
            meta={},
            inputs={"args": args, "kwargs": kwargs}
        )
        try:
            result = original_call(*args, **kwargs)
            end_span(span_id, outputs={"result": result})
            return result
        except Exception as e:
            end_span(span_id, error=str(e))
            raise

    tool.__call__ = wrapped_call
    return tool
