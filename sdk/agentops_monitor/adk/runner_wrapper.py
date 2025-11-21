# What it does: Wraps Runner execution so you see every run/step/session in platform

from google.adk.runners import Runner

def monitor_runner(runner, api_key):
    from ..tracer import new_trace, end_trace, add_span, end_span
    from ..client import send_trace
    from ..context import get_spans, get_calls

    class WrappedRunner(Runner):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._api_key = api_key

        def run(self, *args, **kwargs):
            # Start the trace
            meta = {
                "runner_type": self.__class__.__name__,
                "runner_args": args,
            }
            trace = new_trace(name="RunnerExecution", meta=meta, tags=["adk"])
            # Runner step span
            span_id = add_span("Runner.run", "runner_step", meta, inputs={})
            try:
                result = super().run(*args, **kwargs)
                end_span(span_id, outputs={"result": result})
            except Exception as e:
                end_span(span_id, error=str(e))
                raise
            finally:
                # End and upload
                end_trace()
                send_trace(trace, get_spans(), *get_calls(), api_key=self._api_key)
            return result

    return WrappedRunner(runner.agent)
