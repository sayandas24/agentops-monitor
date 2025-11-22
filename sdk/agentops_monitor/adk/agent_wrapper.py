# What it does: Wraps LlmAgent/SequentialAgent to capture every method, tool call, LLM decision
from google.adk.agents import LlmAgent, SequentialAgent


def monitor_agent(agent, api_key):
    """Monitor agent using Google ADK's callback system"""
    from ..tracer import add_span, end_span
    
    # Store span IDs in a dict to track them across callbacks
    span_tracker = {}
    
    # Wrap before_model_callback
    original_before_model = agent.before_model_callback
    
    def before_model_wrapper(callback_context, llm_request):
        """Called before the model is invoked"""
        span_id = add_span(
            name=f"{agent.name}:{agent.__class__.__name__}",
            type="llm_call",
            meta={
                "agent_type": agent.__class__.__name__,
                "model": str(agent.model) if agent.model else None,
            },
            inputs={"request": str(llm_request)[:500]}  # Limit size
        )
        span_tracker['current_span'] = span_id
        
        if original_before_model:
            return original_before_model(callback_context, llm_request)
        return None
    
    # Wrap after_model_callback
    original_after_model = agent.after_model_callback
    
    def after_model_wrapper(callback_context, llm_response):
        """Called after the model responds"""
        span_id = span_tracker.pop('current_span', None)
        if span_id:
            end_span(span_id, outputs={"response": str(llm_response)[:500]})
        
        if original_after_model:
            return original_after_model(callback_context, llm_response)
        return None
    
    # Wrap on_model_error_callback
    original_on_error = agent.on_model_error_callback
    
    def on_error_wrapper(callback_context, error):
        """Called when the model encounters an error"""
        span_id = span_tracker.pop('current_span', None)
        if span_id:
            end_span(span_id, error=str(error))
        
        if original_on_error:
            return original_on_error(callback_context, error)
        return None
    
    agent.before_model_callback = before_model_wrapper
    agent.after_model_callback = after_model_wrapper
    agent.on_model_error_callback = on_error_wrapper
    
    return agent
