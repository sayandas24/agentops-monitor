from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from agentops_monitor import monitor_agent, monitor_runner

API_KEY = "AIzaSyCWhedlgKUHAWBXCGBuVYTHZEwEDyzatI4"

agent = LlmAgent(name="Researcher", model="gemini-2.0-flash")
agent = monitor_agent(agent, API_KEY)

runner = Runner(agent)
runner = monitor_runner(runner, API_KEY)

runner.run("What is the future of AI agents?")
# All logs/telemetry sent to your dashboard!
