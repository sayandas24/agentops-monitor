# What it does: Sends final trace data to backend using API key

import requests
import os

BACKEND_API = os.environ.get("AGENTOPS_API_URL", "http://localhost:8000")
DEFAULT_INGEST = f"{BACKEND_API}/traces/ingest"


def send_trace(trace, spans, llm_calls, tool_calls, api_key):
    payload = {
        "api_key": api_key,
        "trace": trace,
        "spans": spans,
        "llm_calls": llm_calls,
        "tool_calls": tool_calls,
    }
    print(f"\n=== AgentOps Monitor: Sending Trace ===")
    print(f"Trace ID: {trace.get('trace_id')}")
    print(f"Spans: {len(spans)}")
    print(f"LLM Calls: {len(llm_calls)}")
    print(f"Tool Calls: {len(tool_calls)}")
    
    if llm_calls:
        print(f"\nLLM Call Details:")
        for span_id, llm_data in llm_calls.items():
            print(f"  - Span: {span_id}")
            print(f"    Model: {llm_data.get('model_name')}")
            print(f"    Tokens: {llm_data.get('input_tokens')} in / {llm_data.get('output_tokens')} out")
            print(f"    Prompt length: {len(llm_data.get('prompt', ''))}")
            print(f"    Response length: {len(llm_data.get('response', ''))}")
    
    if tool_calls:
        print(f"\nTool Call Details:")
        for span_id, tool_data in tool_calls.items():
            print(f"  - Span: {span_id}")
            print(f"    Tool: {tool_data.get('tool_name')}")
    print(f"=====================================\n")
    try:
        resp = requests.post(DEFAULT_INGEST, json=payload, timeout=15)
        if resp.status_code != 200:
            print(f"AgentOps Monitor error: {resp.text}")
        else:
            print(f"Trace uploaded: {trace['trace_id']}")
    except requests.exceptions.ConnectionError as e:
        print(
            f"AgentOps Monitor: Could not connect to backend at {BACKEND_API}. Is the server running?"
        )
    except Exception as e:
        print(f"AgentOps Monitor: Failed to send trace: {e}")
