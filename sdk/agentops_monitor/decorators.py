# What it does: Lets users monitor custom functions (non-ADK)

from functools import wraps
from .tracer import add_span, end_span


def traceable(name=None, type="agent_step"):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            span_id = add_span(name=name or func.__name__, type=type, meta={})
            try:
                result = func(*args, **kwargs)
                end_span(span_id, outputs={"result": result})
                return result
            except Exception as e:
                end_span(span_id, error=str(e))
                raise

        return wrapper

    return decorator
