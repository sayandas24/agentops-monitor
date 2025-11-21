# What it does: Wraps LlmAgent/SequentialAgent to capture every method, tool call, LLM decision
from google.adk.agents import LlmAgent, SequentialAgent


def monitor_agent(agent, api_key):
    original_llm_call = agent.llm_call

    def wrapped_llm_call(*args, **kwargs):
        from ..tracer import add_span, end_span

        span_id = add_span(
            name=f"{agent.name}:{agent.__class__.__name__}",
            type="llm_call",
            meta={
                "agent_type": agent.__class__.__name__,
                "model": getattr(agent, "model", None),
            },
        )
        try:
            result = original_llm_call(*args, **kwargs)
            end_span(span_id, outputs={"result": result})
            return result
        except Exception as e:
            end_span(span_id, error=str(e))
            raise

    agent.llm_call = wrapped_llm_call

    # Repeat for any additional methods as needed (like tool calls etc.)
    return agent
