# AgentOps Monitor SDK

[![PyPI version](https://badge.fury.io/py/agentops-monitor.svg)](https://badge.fury.io/py/agentops-monitor)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight monitoring SDK for AI agents built with Google ADK. Track agent executions, tool calls, and performance metrics in real-time with minimal code changes.

## Features

- 🔍 **Agent Monitoring** - Automatic tracing of ADK agent executions
- 🛠️ **Tool Tracking** - Capture tool calls, inputs, and outputs
- 📊 **Performance Metrics** - Track execution time, token usage, and costs
- 🎯 **Custom Tracing** - Add custom spans with the `@traceable` decorator
- 🔄 **Runner Integration** - Monitor entire agent workflows
- 🌐 **A2A Support** - Optional agent-to-agent communication monitoring
- 🚀 **Zero Config** - Works out of the box with environment variables

## Installation

```bash
pip install agentops-monitor
```

For agent-to-agent (A2A) monitoring support:

```bash
pip install agentops-monitor[a2a]
```

## Quick Start

### 1. Set Up Environment Variables

Create a `.env` file in your project root:

```bash
AGENTOPS_API_KEY="your-api-key-here"
AGENTOPS_PROJECT_ID="your-project-id"
AGENTOPS_BASE_URL="http://localhost:8000"  # Optional, defaults to production
```

**Getting Your API Key:**
1. Deploy the AgentOps Monitor backend (see [Backend Setup](#backend-setup))
2. Register an account via the web interface
3. Create a project in the dashboard
4. Generate an API key for your project

### 2. Monitor Your Agent

```python
from google.adk.agents import Agent
from agentops_monitor import monitor_agent
import os

# Create your agent
agent = Agent(
    name="MyAgent",
    model="gemini-2.5-flash",
    instruction="You are a helpful assistant."
)

# Wrap it with monitoring
api_key = os.getenv("AGENTOPS_API_KEY")
monitored_agent = monitor_agent(agent, api_key)

# Use normally - monitoring happens automatically!
result = monitored_agent.run("What is the weather today?")
```

### 3. View Your Traces

Open the AgentOps Monitor dashboard to see:
- Agent execution traces
- Tool calls and results
- Performance metrics
- Token usage and costs
- Error tracking

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AGENTOPS_API_KEY` | Yes | - | Your API key from the dashboard |
| `AGENTOPS_PROJECT_ID` | Yes | - | Project ID from the dashboard |
| `AGENTOPS_BASE_URL` | No | Production URL | Backend URL (use `http://localhost:8000` for local) |

### Programmatic Configuration

```python
from agentops_monitor.client import AgentOpsClient

client = AgentOpsClient(
    api_key="your-api-key",
    project_id="your-project-id",
    base_url="http://localhost:8000"
)
```

## Usage Examples

### Monitor ADK Agents

```python
from google.adk.agents import Agent
from agentops_monitor import monitor_agent

agent = Agent(name="SearchAgent", model="gemini-2.5-flash")
monitored_agent = monitor_agent(agent, api_key="your-key")

# All agent calls are now traced
response = monitored_agent.run("Search for Python tutorials")
```

### Monitor Runners

```python
from google.adk.runners import Runner
from agentops_monitor import monitor_runner

runner = Runner(app=app, session_service=session_service)
monitored_runner = monitor_runner(runner, api_key="your-key")

# Runner execution is now traced
for event in monitored_runner.run(user_id="user123", session_id="session456", new_message=message):
    print(event)
```

### Wrap Custom Tools

```python
from google.adk.tools import google_search
from agentops_monitor import wrap_tool

# Wrap individual tools to track their usage
wrapped_search = wrap_tool(google_search)

agent = Agent(
    name="SearchAgent",
    tools=[wrapped_search],  # Use wrapped tool
    model="gemini-2.5-flash"
)
```

### Custom Tracing with @traceable

```python
from agentops_monitor import traceable

@traceable(name="data_processing")
def process_data(data):
    # Your custom logic here
    result = transform(data)
    return result

# Function calls are automatically traced
result = process_data(my_data)
```

### Complete Example

```python
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import google_search
from google.genai import types
from agentops_monitor import monitor_agent, monitor_runner, wrap_tool
import os
from dotenv import load_dotenv

load_dotenv()

# Wrap tools
wrapped_search = wrap_tool(google_search)

# Create and monitor agent
agent = Agent(
    name="SearchAgent",
    model="gemini-2.5-flash",
    tools=[wrapped_search],
    instruction="You are a search specialist."
)
agent = monitor_agent(agent, os.getenv("AGENTOPS_API_KEY"))

# Create app and runner
app = App(name="SearchApp", root_agent=agent)
session_service = InMemorySessionService()
runner = Runner(app=app, session_service=session_service)
runner = monitor_runner(runner, os.getenv("AGENTOPS_API_KEY"))

# Run with monitoring
message = types.Content(parts=[types.Part(text="What is AI?")], role="user")
for event in runner.run(user_id="user123", session_id="session456", new_message=message):
    if hasattr(event, "content") and event.content:
        print(event.content)
```

## Backend Setup

The SDK requires a backend server to store and visualize traces. You have two deployment options:

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/agentops-monitor.git
cd agentops-monitor

# Start with Docker Compose
docker-compose up -d
```

This starts:
- Backend API on `http://localhost:8000`
- Frontend dashboard on `http://localhost:3000`
- PostgreSQL database

### Option 2: Manual Deployment

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Set up database
export DATABASE_URL="postgresql://user:pass@localhost:5432/agentops"

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000
```

See the [Backend Documentation](https://github.com/yourusername/agentops-monitor/tree/main/backend) for detailed deployment instructions.

## Requirements

- Python 3.8 or higher
- Google ADK (`google-adk>=1.13.0`)
- Active AgentOps Monitor backend instance

## API Reference

### `monitor_agent(agent, api_key, project_id=None, base_url=None)`

Wraps an ADK agent with monitoring capabilities.

**Parameters:**
- `agent` (Agent): The ADK agent to monitor
- `api_key` (str): Your AgentOps API key
- `project_id` (str, optional): Project ID (defaults to env var)
- `base_url` (str, optional): Backend URL (defaults to env var)

**Returns:** Monitored agent instance

### `monitor_runner(runner, api_key, project_id=None, base_url=None)`

Wraps an ADK runner with monitoring capabilities.

**Parameters:**
- `runner` (Runner): The ADK runner to monitor
- `api_key` (str): Your AgentOps API key
- `project_id` (str, optional): Project ID (defaults to env var)
- `base_url` (str, optional): Backend URL (defaults to env var)

**Returns:** Monitored runner instance

### `wrap_tool(tool)`

Wraps an ADK tool to track its usage.

**Parameters:**
- `tool`: The ADK tool to wrap

**Returns:** Wrapped tool instance

### `@traceable(name=None, **kwargs)`

Decorator for custom function tracing.

**Parameters:**
- `name` (str, optional): Custom span name (defaults to function name)
- `**kwargs`: Additional metadata to attach to the trace

**Example:**
```python
@traceable(name="custom_operation", category="data")
def my_function(x):
    return x * 2
```

## Troubleshooting

### "AGENTOPS_API_KEY environment variable is required"

Make sure you've set the API key in your `.env` file or environment:
```bash
export AGENTOPS_API_KEY="your-key-here"
```

### "Connection refused" or network errors

Verify your backend is running and accessible:
```bash
curl http://localhost:8000/health
```

### Traces not appearing in dashboard

1. Check that your API key is valid
2. Verify the project ID matches your dashboard project
3. Check backend logs for authentication errors
4. Ensure `AGENTOPS_BASE_URL` points to the correct backend

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/yourusername/agentops-monitor#readme)
- 🐛 [Issue Tracker](https://github.com/yourusername/agentops-monitor/issues)
- 💬 [Discussions](https://github.com/yourusername/agentops-monitor/discussions)

## Changelog

### v0.1.0 (Initial Release)

- ✨ Agent monitoring for Google ADK
- ✨ Runner monitoring support
- ✨ Tool wrapping and tracking
- ✨ Custom tracing with @traceable decorator
- ✨ Environment variable configuration
- ✨ Optional A2A monitoring support
- 📚 Comprehensive documentation and examples
