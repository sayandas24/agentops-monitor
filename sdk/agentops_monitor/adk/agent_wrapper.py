# What it does: Wraps LlmAgent/SequentialAgent to capture every method, tool call, LLM decision
from google.adk.agents import LlmAgent, SequentialAgent


def extract_model_info(agent):
    """Extract model name and provider from agent configuration"""
    try:
        if hasattr(agent, "model") and agent.model:
            # Try different ways to get model name
            model_name = None
            if hasattr(agent.model, "model_name"):
                model_name = agent.model.model_name
            elif hasattr(agent.model, "_model_name"):
                model_name = agent.model._model_name
            elif isinstance(agent.model, str):
                model_name = agent.model
            else:
                model_name = str(agent.model)

            # Determine provider based on model name
            if model_name and (
                "gemini" in model_name.lower() or "google" in model_name.lower()
            ):
                provider = "google"
            elif model_name and (
                "gpt" in model_name.lower() or "openai" in model_name.lower()
            ):
                provider = "openai"
            else:
                provider = "unknown"
            return model_name or "unknown", provider
        return "unknown", "unknown"
    except Exception as e:
        print(f"[DEBUG] Error extracting model info: {e}")
        return "unknown", "unknown"


def monitor_agent(agent, api_key):
    """Monitor agent using Google ADK's callback system"""
    from ..tracer import add_span, end_span

    # Extract model info once
    model_name, provider = extract_model_info(agent)

    # Store span IDs and model info in a dict to track them across callbacks
    span_tracker = {"model_name": model_name, "provider": provider}

    # Wrap before_model_callback
    original_before_model = agent.before_model_callback

    def before_model_wrapper(callback_context, llm_request):
        """Called before the model is invoked"""
        # Extract full prompt from llm_request
        prompt_parts = []
        try:
            # Try to get the full request as string first
            prompt_str = str(llm_request)
            if prompt_str and len(prompt_str) > 10:
                prompt_parts.append(prompt_str)

            # Also try to extract structured data
            if (
                hasattr(llm_request, "system_instruction")
                and llm_request.system_instruction
            ):
                prompt_parts.append(f"System: {llm_request.system_instruction}")

            if hasattr(llm_request, "messages") and llm_request.messages:
                for msg in llm_request.messages:
                    if hasattr(msg, "content"):
                        prompt_parts.append(str(msg.content))
                    elif hasattr(msg, "parts"):
                        for part in msg.parts:
                            if hasattr(part, "text"):
                                prompt_parts.append(part.text)
        except Exception as e:
            print(f"[DEBUG] Error extracting prompt: {e}")
            prompt_parts.append(str(llm_request)[:1000])

        prompt = "\n".join(prompt_parts) if prompt_parts else str(llm_request)[:1000]

        span_id = add_span(
            name=f"{agent.name}:{agent.__class__.__name__}",
            type="llm_call",
            meta={
                "agent_type": agent.__class__.__name__,
                "model": span_tracker["model_name"],
            },
            inputs={"request": prompt[:500]},
        )
        span_tracker["current_span"] = span_id
        span_tracker["prompt"] = prompt

        if original_before_model:
            return original_before_model(callback_context, llm_request)
        return None

    # Wrap after_model_callback
    original_after_model = agent.after_model_callback

    def after_model_wrapper(callback_context, llm_response):
        """Called after the model responds"""
        from ..tracer import add_llm_call

        span_id = span_tracker.pop("current_span", None)
        prompt = span_tracker.pop("prompt", "")

        if span_id:
            # Extract response text
            response_text = ""
            input_tokens = 0
            output_tokens = 0

            try:
                # Try string representation first
                response_str = str(llm_response)
                if response_str and len(response_str) > 10:
                    response_text = response_str

                # Try to extract structured response
                if hasattr(llm_response, "candidates") and llm_response.candidates:
                    candidate = llm_response.candidates[0]
                    if hasattr(candidate, "content"):
                        if (
                            hasattr(candidate.content, "parts")
                            and candidate.content.parts
                        ):
                            parts = candidate.content.parts
                            if hasattr(parts[0], "text"):
                                response_text = parts[0].text
                        elif hasattr(candidate.content, "text"):
                            response_text = candidate.content.text

                # Extract token usage
                if hasattr(llm_response, "usage_metadata"):
                    usage = llm_response.usage_metadata
                    input_tokens = getattr(usage, "prompt_token_count", 0)
                    output_tokens = getattr(usage, "candidates_token_count", 0)
            except Exception as e:
                print(f"[DEBUG] Error extracting response: {e}")
                # Fallback to string representation
                if not response_text:
                    response_text = str(llm_response)[:1000]

            # Create LLM call record
            add_llm_call(
                span_id=span_id,
                model_name=span_tracker["model_name"],
                provider=span_tracker["provider"],
                prompt=prompt,
                response=response_text,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            )

            end_span(span_id, outputs={"response": response_text[:500]})

        if original_after_model:
            return original_after_model(callback_context, llm_response)
        return None

    # Wrap on_model_error_callback
    original_on_error = agent.on_model_error_callback

    def on_error_wrapper(callback_context, error, **kwargs):
        """Called when the model encounters an error"""
        span_id = span_tracker.pop("current_span", None)
        if span_id:
            end_span(span_id, error=str(error))

        if original_on_error:
            return original_on_error(callback_context, error, **kwargs)
        return None

    agent.before_model_callback = before_model_wrapper
    agent.after_model_callback = after_model_wrapper
    agent.on_model_error_callback = on_error_wrapper

    # Recursively monitor nested agents and tools
    if hasattr(agent, "tools") and agent.tools:
        from .tool_wrapper import wrap_tool
        
        for i, tool in enumerate(agent.tools):
            # Check if this is an AgentTool (agent wrapped as a tool)
            try:
                from google.adk.tools.agent_tool import AgentTool
                
                if isinstance(tool, AgentTool):
                    # Get the wrapped agent and monitor it recursively
                    if hasattr(tool, "agent") or hasattr(tool, "_agent"):
                        wrapped_agent = getattr(tool, "agent", None) or getattr(tool, "_agent", None)
                        if wrapped_agent:
                            # Recursively monitor the nested agent
                            monitor_agent(wrapped_agent, api_key)
                else:
                    # Regular tool - wrap it
                    wrap_tool(tool)
            except (ImportError, AttributeError):
                # If AgentTool is not available or tool doesn't match pattern, try wrapping as regular tool
                try:
                    wrap_tool(tool)
                except Exception as e:
                    print(f"[DEBUG] Could not wrap tool {tool}: {e}")

    return agent
