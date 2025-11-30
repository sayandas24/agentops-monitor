# AgentOps Monitor

Production-grade observability for Google ADK agents with **one line of code**.

[![PyPI](https://img.shields.io/pypi/v/agentops-monitor)](https://pypi.org/project/agentops-monitor)

## The Problem

Building AI agents is exciting, but debugging them in production is a nightmare. When an agent fails or produces unexpected results, you have zero visibility into what happened—which LLM call went wrong, which tools were invoked, or how much the interaction cost.

## The Solution

AgentOps Monitor provides complete observability for Google ADK agents with just 2 lines of code:

```python
from agentops_monitor import monitor_agent

agent = monitor_agent(agent, api_key)
```

That's it. Now you get:

- 🔍 **Full execution traces** - LLM prompts/responses, tool calls, A2A messages
- 💰 **Cost tracking** - Real-time token usage and cost per interaction
- ⚡ **Performance metrics** - Latency, bottlenecks, and execution timelines
- 🐛 **Error tracking** - Stack traces with full context when things go wrong
- 📊 **Visual dashboard** - Interactive timeline views and session replays

## Quick Start

### 1. Install the SDK

```bash
pip install agentops-monitor
```

### 2. Deploy the Backend

```bash
git clone https://github.com/sayandas24/agentops-monitor.git
cd agentops-monitor
docker compose up -d
```

Services will be running at:

- Backend API: `http://localhost:8000`
- Dashboard: `http://localhost:3000`

### 3. Monitor Your Agent

```python
from google.adk.agents import Agent
from agentops_monitor import monitor_agent
import os

agent = Agent(name="MyAgent", model="gemini-2.5-flash")
agent = monitor_agent(agent, os.getenv("AGENTOPS_API_KEY"))

# Now every execution is fully traced!
result = agent.run("Your prompt here")
```

## Access the Dashboard

Once your agent is running with monitoring enabled, you can view traces in the dashboard:

**🌐 Live Demo:** [agentops.vercel.app](https://agentops.vercel.app)

**💻 Local Access:** `http://localhost:3000` (after running `docker compose up -d`)

## Architecture

```
┌────────────┐     ┌──────────┐     ┌───────────┐
│ Python SDK │───▶│ FastAPI  │───▶│  Next.js  │
│   (PyPI)   │     │ Supabase │     │ Dashboard │
└────────────┘     └──────────┘     └───────────┘
```

- **SDK**: Lightweight wrapper with async trace sending (<5ms overhead)
- **Backend**: FastAPI + Supabase with API key authentication
- **Frontend**: Next.js dashboard with real-time visualizations

## Why AgentOps Monitor?

Unlike generic LLM monitoring tools, AgentOps Monitor is **purpose-built for Google ADK**:

- ✅ Understands agent hierarchies and runner orchestration
- ✅ Tracks agent-to-agent (A2A) communication
- ✅ Preserves multi-turn conversation context
- ✅ Self-hostable with Docker Compose
- ✅ Zero code changes required beyond the wrapper

## Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Docker Setup](./DOCKER_SETUP_GUIDE.md)
- [How It Works](./HOW_IT_WORKS.md)
- [PyPI Publishing](./PYPI_PUBLISHING_GUIDE.md)

## Tech Stack

- **SDK**: Python, Google ADK, httpx
- **Backend**: FastAPI, Supabase (PostgreSQL), Pydantic
- **Frontend**: Next.js, TypeScript, TailwindCSS, Recharts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

Built with ❤️ for the AI agent developer community.
