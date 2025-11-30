import warnings
import logging

# Suppress Google ADK's app name mismatch warning (cosmetic only, doesn't affect functionality)
# This improves user experience by hiding misleading warnings from the SDK
warnings.filterwarnings('ignore', message='App name mismatch detected')
logging.getLogger('google_adk.google.adk.runners').setLevel(logging.ERROR)

from .adk.agent_wrapper import monitor_agent
from .adk.runner_wrapper import monitor_runner
from .adk.tool_wrapper import wrap_tool
from .decorators import traceable
from .client import get_client

def flush_traces(timeout=5):
    """Wait for all queued traces to be sent. Call this before your script exits."""
    client = get_client()
    client.flush(timeout)

def shutdown():
    """Gracefully shutdown the AgentOps Monitor client. Call this at the end of your script."""
    client = get_client()
    client.shutdown()

# Optional import for a2a monitoring
try:
    from .adk.a2a_monitor import monitor_a2a
    __all__ = [
        "monitor_agent", "monitor_runner", "monitor_a2a", "wrap_tool", "traceable",
        "flush_traces", "shutdown"
    ]
except ImportError:
    __all__ = [
        "monitor_agent", "monitor_runner", "wrap_tool", "traceable",
        "flush_traces", "shutdown"
    ]
