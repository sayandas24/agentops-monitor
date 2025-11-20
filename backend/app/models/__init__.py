# Define tables in Supabase (users, projects, traces, spans, etc.)

from app.models.user import User
from app.models.project import Project
from app.models.trace import Trace
from app.models.span import Span, LLMCall, ToolCall

__all__ = ["User", "Project", "Trace", "Span", "LLMCall", "ToolCall"]
