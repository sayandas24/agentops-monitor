# What it does: Sends final trace data to backend using API key with retry logic and async sending

import requests
import os
import threading
import queue
import time
import logging
import atexit
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agentops_monitor")

BACKEND_API = os.environ.get("AGENTOPS_API_URL", "http://localhost:8000")
DEFAULT_INGEST = f"{BACKEND_API}/traces/ingest"


class AgentOpsClient:
    """Client for sending traces to AgentOps Monitor backend with async sending and retry logic"""
    
    def __init__(self, max_queue_size=1000):
        self.shutdown_event = threading.Event()  # Create this FIRST
        self.session = self._create_session_with_retries()
        self.trace_queue = queue.Queue(maxsize=max_queue_size)
        self.worker_thread = threading.Thread(target=self._process_queue, daemon=True)
        self.worker_thread.start()
        logger.info(f"AgentOps Monitor client initialized. Backend: {BACKEND_API}")
    
    def _create_session_with_retries(self):
        """Create requests session with retry strategy"""
        session = requests.Session()
        
        # Retry strategy: 3 attempts with exponential backoff
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,  # Wait 1s, 2s, 4s between retries
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["POST"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        return session
    
    def send_trace(self, trace, spans, llm_calls, tool_calls, api_key):
        """
        Queue trace for async sending (non-blocking)
        This method returns immediately without waiting for upload
        """
        payload = {
            "api_key": api_key,
            "trace": trace,
            "spans": spans,
            "llm_calls": llm_calls,
            "tool_calls": tool_calls,
        }
        
        try:
            self.trace_queue.put_nowait(payload)
        except queue.Full:
            logger.warning(f"Trace queue full, dropping trace {trace.get('trace_id')}")
    
    def _process_queue(self):
        """Background worker that sends queued traces"""
        while not self.shutdown_event.is_set():
            try:
                # Wait up to 1 second for a trace
                payload = self.trace_queue.get(timeout=1)
                self._send_trace_sync(payload)
                self.trace_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error processing trace queue: {e}")
    
    def _send_trace_sync(self, payload):
        """Synchronously send a single trace with retry logic"""
        trace = payload.get("trace", {})
        trace_id = trace.get("trace_id", "unknown")
        
        logger.info(f"Sending trace {trace_id} [{trace.get('name')}]")
        
        try:
            resp = self.session.post(
                DEFAULT_INGEST,
                json=payload,
                timeout=10  # 10 second timeout
            )
            resp.raise_for_status()
            
            logger.info(f"✅ Trace uploaded: {trace_id}")
            
        except requests.exceptions.Timeout:
            logger.error(f"❌ Timeout sending trace {trace_id}")
        except requests.exceptions.ConnectionError:
            logger.error(f"❌ Cannot connect to AgentOps backend at {BACKEND_API}")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                logger.error(f"❌ Invalid API key for trace {trace_id}")
            elif e.response.status_code == 429:
                logger.warning(f"⚠️  Rate limit exceeded for trace {trace_id}")
            else:
                try:
                    error_detail = e.response.json()
                    logger.error(f"❌ HTTP error {e.response.status_code} for trace {trace_id}: {error_detail}")
                except:
                    logger.error(f"❌ HTTP error {e.response.status_code} for trace {trace_id}: {e.response.text[:500]}")
        except Exception as e:
            import traceback
            logger.error(f"❌ Failed to send trace {trace_id}: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
    
    def flush(self, timeout=5):
        """Wait for all queued traces to be sent (useful for shutdown)"""
        start_time = time.time()
        
        # Wait for all tasks in the queue to be processed and marked as done
        # This properly waits for the worker thread to finish sending traces
        try:
            # First, wait for queue.join() with timeout
            remaining = timeout
            while remaining > 0 and not self.trace_queue.empty():
                # Check periodically with small timeouts
                check_interval = min(0.1, remaining)
                time.sleep(check_interval)
                remaining = timeout - (time.time() - start_time)
            
            # If queue is empty, give worker thread a moment to complete current send
            if self.trace_queue.empty():
                time.sleep(0.2)  # Brief wait for worker to complete current HTTP request
                logger.info("All traces flushed successfully")
            else:
                logger.warning(f"{self.trace_queue.qsize()} traces remaining in queue after flush timeout")
                
        except Exception as e:
            logger.error(f"Error during flush: {e}")
            if not self.trace_queue.empty():
                logger.warning(f"{self.trace_queue.qsize()} traces were not sent")
    
    def shutdown(self):
        """Gracefully shutdown client"""
        logger.info("Shutting down AgentOps Monitor client...")
        self.shutdown_event.set()
        self.flush()
        self.worker_thread.join(timeout=5)
        self.session.close()


# Global client instance
_client = None
_atexit_registered = False

def _cleanup_on_exit():
    """Automatically flush traces when Python exits"""
    global _client
    if _client is not None:
        logger.info("Python exiting, flushing remaining traces...")
        _client.flush(timeout=10)

def get_client():
    """Get or create global client instance"""
    global _client, _atexit_registered
    if _client is None:
        _client = AgentOpsClient()
        
        # Register cleanup handler on first client creation
        if not _atexit_registered:
            atexit.register(_cleanup_on_exit)
            _atexit_registered = True
            logger.info("Registered automatic trace flushing on exit")
    
    return _client


def send_trace(trace, spans, llm_calls, tool_calls, api_key):
    """
    Send trace data to backend (async, non-blocking)
    This is the main entry point used by the SDK
    """
    client = get_client()
    client.send_trace(trace, spans, llm_calls, tool_calls, api_key)
