# What it does: Hooks into RemoteA2aAgent and traces agent<->agent messages, task lifecycle

from google.adk.agents.remote_a2a_agent import RemoteA2aAgent


def monitor_a2a(remote_agent):
    original_send = remote_agent.send

    def wrapped_send(*args, **kwargs):
        from ..tracer import add_span, end_span

        span_id = add_span(
            name="A2A message",
            type="a2a_message",
            meta={"destination": str(remote_agent.url)},
            inputs={"args": args, "kwargs": kwargs},
        )
        try:
            result = original_send(*args, **kwargs)
            end_span(span_id, outputs={"response": result})
            return result
        except Exception as e:
            end_span(span_id, error=str(e))
            raise

    remote_agent.send = wrapped_send
    return remote_agent
