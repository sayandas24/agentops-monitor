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
    print(
        f"trace: {trace} \n spans: {spans} \n llm_calls: {llm_calls} \n tool_calls: {tool_calls} \n  api_key: {api_key} \n"
    )
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
