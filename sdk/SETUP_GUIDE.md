# SDK Setup Guide

## The Problem
The error "Invalid API key" occurs because the test was using a **Gemini API key** instead of an **AgentOps project API key**.

The backend expects a project API key (format: `agentops_xxxxx`) that exists in the database.

## Solution

### Step 1: Install dependencies
```bash
cd sdk
pip install -r requirements.txt
```

### Step 2: Make sure backend is running
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Create a test project and get API key
```bash
cd sdk
python examples/setup_test_project.py
```

This will:
- Register a test user (test@example.com)
- Login and get an auth token
- Create a test project
- Generate an API key (format: `agentops_xxxxx`)
- Save the API key to `sdk/.env`

### Step 4: Run your test
```bash
python examples/test_adk_agent.py
```

## What Changed

**Before:**
```python
API_KEY = "AIzaSyCWhedlgKUHAWBXCGBuVYTHZEwEDyzatI4"  # ❌ This is a Gemini key
```

**After:**
```python
API_KEY = os.getenv("AGENTOPS_API_KEY")  # ✅ This is your AgentOps project key
```

## Understanding the Keys

- **Gemini API Key** (`AIzaSy...`): Used by the agent to call Google's LLM
- **AgentOps API Key** (`agentops_...`): Used by the SDK to authenticate with your backend

The SDK needs the AgentOps key to send traces to your backend!
