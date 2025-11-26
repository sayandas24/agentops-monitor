from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import google_search
from google.genai import types
import uuid
import asyncio
import os
from dotenv import load_dotenv
from agentops_monitor import monitor_agent, monitor_runner
from agentops_monitor.adk.tool_wrapper import wrap_tool

load_dotenv()
AGENTOPS_API_KEY = os.getenv("AGENTOPS_API_KEY", "test_key")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError(
        "GOOGLE_API_KEY not found in environment. Please create a .env file with your API key."
    )

os.environ["AGENTOPS_API_URL"] = "http://localhost:8000"
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Wrap the google_search tool
wrapped_search = wrap_tool(google_search)

search_agent = Agent(
    name="SearchAgent",
    model="gemini-2.5-flash",
    tools=[wrapped_search],
    instruction="You MUST use the google_search tool to answer questions. Always search before answering.",
)

search_agent = monitor_agent(search_agent, AGENTOPS_API_KEY)
app = App(name="SearchApp", root_agent=search_agent)

session_service = InMemorySessionService()
runner = Runner(app=app, session_service=session_service)
runner = monitor_runner(runner, AGENTOPS_API_KEY)

user_id = "test_user"
session_id = str(uuid.uuid4())


async def create_session():
    await runner.session_service.create_session(
        user_id=user_id, session_id=session_id, app_name="SearchApp"
    )


asyncio.run(create_session())

# Ask a question that requires a search
test_prompt = "How can i find the best courses for python, what are the available sources are there?"
message = types.Content(parts=[types.Part(text=test_prompt)], role="user")

print(f"Testing tool capture with prompt: {test_prompt}\n")

responses = []
for event in runner.run(user_id=user_id, session_id=session_id, new_message=message):
    if hasattr(event, "content") and event.content:
        for part in event.content.parts:
            if hasattr(part, "text") and part.text:
                print("Response:", part.text[:200])
                responses.append(part.text)

print("\nTest complete!")
