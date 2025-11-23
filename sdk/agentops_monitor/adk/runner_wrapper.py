# What it does: Wraps Runner execution so you see every run/step/session in platform

from google.adk.runners import Runner

def monitor_runner(runner, api_key):
    from ..tracer import new_trace, end_trace, add_span, end_span
    from ..client import send_trace

    class WrappedRunner(Runner):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._api_key = api_key

        def run(self, *args, **kwargs):
            # Start the trace
            meta = {
                "runner_type": self.__class__.__name__,
                "runner_args": str(args)[:200],  # Limit size
            }
            trace = new_trace(name="RunnerExecution", meta=meta, tags=["adk"])
            # Runner step span
            span_id = add_span("Runner.run", "runner_step", meta, inputs={"args": str(args)[:200]})
            
            try:
                # Get the generator from super().run()
                result_generator = super().run(*args, **kwargs)
                
                # Yield all events from the generator
                for event in result_generator:
                    yield event
                
                # After generator is exhausted, end the span
                end_span(span_id, outputs={"completed": True})
                
            except Exception as e:
                end_span(span_id, error=str(e))
                raise
            finally:
                # End and upload trace with all collected data
                trace, spans, llm_calls, tool_calls = end_trace()
                send_trace(trace, spans, llm_calls, tool_calls, api_key=self._api_key)

    # Get the app and session_service from the runner
    kwargs = {}
    if hasattr(runner, 'app') and runner.app:
        kwargs['app'] = runner.app
    elif hasattr(runner, 'agent') and runner.agent:
        # Fallback for older API or direct agent usage
        kwargs['agent'] = runner.agent
    else:
        raise ValueError("Runner must have either an app or agent attribute")
    
    # Pass through the session_service
    if hasattr(runner, 'session_service') and runner.session_service:
        kwargs['session_service'] = runner.session_service
    
    return WrappedRunner(**kwargs)
