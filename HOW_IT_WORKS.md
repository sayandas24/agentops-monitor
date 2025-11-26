# 🎯 How AgentOps Monitor Works - Complete Flow

This document explains how developers will use your AgentOps monitoring system, from installation to deployment.

---

## 📊 System Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Developer's Application                    │
│                                                                │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  from agentops_monitor import monitor_agent         │   │
│   │                                                       │   │
│   │  agent = Agent(...)                                  │   │
│   │  monitored_agent = monitor_agent(agent, api_key)    │   │
│   │                                                       │   │
│   │  result = monitored_agent.run("hello")   ←────────┐ │   │
│   └────────────────────────────────┬──────────────────┘ │   │
│                                    │                     │   │
└────────────────────────────────────┼─────────────────────┼───┘
                                     │                     │
                    ┌────────────────▼─────────────────┐  │
                    │   AgentOps Monitor SDK (PyPI)    │  │
                    │   - Wraps agent calls            │  │
                    │   - Captures tool calls          │  │
                    │   - Tracks metrics               │  │
                    │   - Sends traces to backend      │  │
                    └────────────────┬─────────────────┘  │
                                     │                     │
                            HTTP POST /traces/ingest       │
                                     │                     │
                    ┌────────────────▼─────────────────┐  │
                    │   Backend API (FastAPI)          │  │
                    │   - Validates API key            │  │
                    │   - Stores traces in Supabase    │  │
                    │   - Provides query endpoints     │  │
                    └────────────────┬─────────────────┘  │
                                     │                     │
                    ┌────────────────▼─────────────────┐  │
                    │   Supabase PostgreSQL            │  │
                    │   - Stores traces & spans        │  │
                    │   - Stores projects & users      │  │
                    │   - Stores API keys              │  │
                    └────────────────┬─────────────────┘  │
                                     │                     │
                    ┌────────────────▼─────────────────┐  │
                    │   Frontend Dashboard (Next.js)   │  │
                    │   - Visualizes traces            │  │
                    │   - Shows metrics & analytics    │  │
                    │   - Manages projects & API keys  │◄─┘
                    └──────────────────────────────────┘
```

---

## 🚀 Complete User Journey

### Phase 1: Developer Sets Up Backend (You Deploy This)

#### Step 1: Deploy Backend Infrastructure

**Option A: Railway/Render (Easiest)**

```bash
# 1. Fork your repo to their GitHub
# 2. Connect to Railway/Render
# 3. Set environment variables:
#    - DATABASE_URL (Supabase)
#    - SECRET_KEY
#    - GEMINI_API_KEY
# 4. Deploy automatically
```

**Option B: Docker (Self-hosted)**

```bash
# Clone your repo
git clone https://github.com/sayandas24/agentops-monitor.git
cd agentops-monitor/backend

# Configure environment
cp .env.example .env
# Edit .env with Supabase credentials

# Start services
docker compose up -d

# Backend running on: http://localhost:8000
# Frontend running on: http://localhost:3000
```

#### Step 2: Access Dashboard

```
Open: http://localhost:3000 (or your deployed URL)
```

---

### Phase 2: User Gets API Key

#### Step 1: Register Account

```
1. Go to dashboard: http://your-domain.com
2. Click "Sign Up"
3. Enter email & password
4. Account created!
```

#### Step 2: Create Project

```
1. Login to dashboard
2. Click "Create Project"
3. Name: "My AI Agent"
4. Project ID generated: proj_abc123
```

#### Step 3: Generate API Key

```
1. Go to project settings
2. Click "Generate API Key"
3. Copy key: agentops_sk_xyz789abc...
4. Save it securely!
```

---

### Phase 3: User Installs SDK (PyPI)

```bash
# Install from PyPI
pip install agentops-monitor

# Or with A2A support
pip install agentops-monitor[a2a]
```

---

### Phase 4: User Integrates SDK

#### Minimal Integration (2 lines of code!)

**Before:**

```python
from google.adk.agents import Agent

agent = Agent(
    name="MyAgent",
    model="gemini-2.5-flash",
    instruction="You are helpful."
)

result = agent.run("What is AI?")
print(result)
```

**After (with monitoring):**

```python
from google.adk.agents import Agent
from agentops_monitor import monitor_agent  # ← Add this
import os

agent = Agent(
    name="MyAgent",
    model="gemini-2.5-flash",
    instruction="You are helpful."
)

# Wrap agent with monitoring
agent = monitor_agent(agent, os.getenv("AGENTOPS_API_KEY"))  # ← Add this

result = agent.run("What is AI?")
print(result)
# Trace automatically sent to backend!
```

#### Environment Setup

**.env file:**

```bash
AGENTOPS_API_KEY=agentops_sk_xyz789abc...
AGENTOPS_PROJECT_ID=proj_abc123
AGENTOPS_BASE_URL=http://localhost:8000  # or your deployed URL
```

---

### Phase 5: User Sees Traces in Dashboard

#### What Happens Under the Hood

1. **User runs agent:**

   ```python
   result = monitored_agent.run("What is AI?")
   ```

2. **SDK captures:**

   - Agent name, start time, end time
   - Input: "What is AI?"
   - Output: Agent's response
   - LLM calls (model, tokens, cost)
   - Tool calls (if any)
   - Errors (if any)

3. **SDK sends to backend:**

   ```http
   POST /traces/ingest
   {
     "api_key": "agentops_sk_xyz789abc...",
     "trace": {
       "trace_id": "trace_123",
       "agent_name": "MyAgent",
       "status": "completed",
       "start_time": "2025-11-26T12:00:00Z",
       "end_time": "2025-11-26T12:00:05Z"
     },
     "spans": [...],
     "llm_calls": [...],
     "tool_calls": [...]
   }
   ```

4. **Backend validates:**

   - Checks API key is valid
   - Finds associated project
   - Stores in Supabase

5. **User views in dashboard:**
   - Real-time trace appears
   - Click for details
   - See metrics, tokens, costs

---

## 📦 Publishing SDK to PyPI

### Pre-Publish Checklist

- [x] Package structure correct
- [x] `pyproject.toml` configured
- [x] `README.md` with clear instructions
- [x] `LICENSE` file included
- [x] Version number set (0.1.0)
- [ ] Test package locally
- [ ] Create PyPI account

### Step-by-Step Publishing

#### 1. Test Package Locally

```bash
cd sdk

# Install in development mode
pip install -e .

# Test it works
python -c "from agentops_monitor import monitor_agent; print('✅ Imports work!')"

# Run examples
cd examples
python test_tool_capture.py
```

#### 2. Build the Package

```bash
cd sdk

# Install build tools
pip install build twine

# Build distribution
python -m build

# This creates:
# - dist/agentops_monitor-0.1.0.tar.gz
# - dist/agentops_monitor-0.1.0-py3-none-any.whl
```

#### 3. Test on TestPyPI First (Recommended)

```bash
# Create account: https://test.pypi.org/account/register/

# Upload to TestPyPI
python -m twine upload --repository testpypi dist/*

# Install from TestPyPI to test
pip install --index-url https://test.pypi.org/simple/ agentops-monitor

# If it works, move to production PyPI!
```

#### 4. Publish to PyPI (Production)

```bash
# Create account: https://pypi.org/account/register/

# Upload to PyPI
python -m twine upload dist/*

# Enter your PyPI credentials
# Username: __token__
# Password: pypi-... (your API token)

# Done! Package is live at: https://pypi.org/project/agentops-monitor/
```

#### 5. Verify Installation

```bash
# Anyone can now install with:
pip install agentops-monitor

# Verify it worked
python -c "import agentops_monitor; print(agentops_monitor.__version__)"
```

---

## 🔑 How API Key Authentication Works

### Backend Flow

```python
# In backend/app/api/traces.py

@router.post("/ingest")
def ingest_trace(data: TraceIngest, db: Session):
    # 1. Extract API key from request
    api_key = data.api_key  # e.g., "agentops_sk_xyz789"

    # 2. Look up project by API key
    project = project_crud.get_project_by_api_key(db, api_key)

    # 3. If not found, reject
    if not project:
        raise HTTPException(401, "Invalid API key")

    # 4. Store trace under this project
    trace = trace_crud.create_trace(db, project.id, data.trace)

    return {"success": True, "trace_id": trace.trace_id}
```

### Security Features

✅ **API Key Validation** - Every request checked  
✅ **Project Isolation** - Users only see their traces  
✅ **JWT for Dashboard** - Secure web authentication  
✅ **HTTPS Required** - In production  
✅ **Rate Limiting** - (You should add this!)

---

## 🎯 Example: Complete E2E Flow

### 1. You Deploy Backend

```bash
# Deploy to Railway
railway up

# Your backend: https://agentops-api.railway.app
# Your frontend: https://agentops-dash.railway.app
```

### 2. Developer Alice Registers

```
1. Goes to: https://agentops-dash.railway.app
2. Signs up: alice@example.com
3. Creates project: "AI Customer Support"
4. Gets API key: agentops_sk_alice_key_123
```

### 3. Alice Installs SDK

```bash
pip install agentops-monitor
```

### 4. Alice Adds to Her Code

```python
# alice_agent.py
from google.adk.agents import Agent
from agentops_monitor import monitor_agent
import os

# Set API key
os.environ["AGENTOPS_API_KEY"] = "agentops_sk_alice_key_123"
os.environ["AGENTOPS_BASE_URL"] = "https://agentops-api.railway.app"

# Create agent
agent = Agent(name="SupportBot", model="gemini-2.5-flash")
agent = monitor_agent(agent, os.getenv("AGENTOPS_API_KEY"))

# Run agent (monitored!)
response = agent.run("How do I reset my password?")
print(response)
```

### 5. Alice Runs Her Agent

```bash
python alice_agent.py
```

**Output:**

```
To reset your password, go to...
```

**Behind the scenes:**

- SDK sends trace to your backend
- Backend stores in Supabase
- Alice sees trace in dashboard immediately!

### 6. Alice Views Dashboard

```
Opens: https://agentops-dash.railway.app
Sees:
- Trace ID: trace_abc123
- Agent: SupportBot
- Duration: 2.3s
- Tokens: 150
- Cost: $0.001
- Status: ✅ Success
```

---

## 💡 Key Concepts for Users

### What is a Trace?

A **trace** is one complete agent execution from start to finish.

```
Trace = One agent.run() call
```

### What is a Span?

A **span** is a step within a trace.

```
Trace: "Answer question about weather"
  ├─ Span: LLM call to Gemini
  ├─ Span: Tool call to weather API
  └─ Span: LLM call to format response
```

### What Gets Tracked?

```python
✅ Agent name
✅ Start/end time
✅ Input prompt
✅ Output response
✅ LLM calls (model, tokens, cost)
✅ Tool calls (name, input, output)
✅ Errors and exceptions
✅ Custom metadata
```

---

## 🚦 Production Readiness Review

I'll create a separate production checklist document...
