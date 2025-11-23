"""
Manual test to verify tool call capture works
"""
from agentops_monitor.tracer import new_trace, end_trace, add_span, end_span, add_tool_call
from agentops_monitor.client import send_trace
import os
from dotenv import load_dotenv

load_dotenv()
AGENTOPS_API_KEY = os.getenv("AGENTOPS_API_KEY", "test_key")
os.environ["AGENTOPS_API_URL"] = "http://localhost:8000"

# Create a trace
trace = new_trace(name="ToolTest", meta={"test": "manual"})

# Create a tool call span
span_id = add_span(
    name="test_calculator",
    type="tool_call",
    meta={},
    inputs={"operation": "add", "a": 5, "b": 3}
)

# Add tool call data
add_tool_call(
    span_id=span_id,
    tool_name="calculator",
    tool_inputs={"operation": "add", "a": 5, "b": 3},
    tool_outputs={"result": 8}
)

# End the span
end_span(span_id, outputs={"result": 8})

# End trace and send
trace, spans, llm_calls, tool_calls = end_trace()

print(f"Trace: {trace['trace_id']}")
print(f"Spans: {len(spans)}")
print(f"LLM Calls: {len(llm_calls)}")
print(f"Tool Calls: {len(tool_calls)}")

if tool_calls:
    for span_id, tool_data in tool_calls.items():
        print(f"\nTool Call:")
        print(f"  Span: {span_id}")
        print(f"  Tool: {tool_data['tool_name']}")
        print(f"  Inputs: {tool_data['tool_inputs']}")
        print(f"  Outputs: {tool_data['tool_outputs']}")

send_trace(trace, spans, llm_calls, tool_calls, AGENTOPS_API_KEY)

print("\nManual test complete!")
