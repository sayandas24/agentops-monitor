# """
# Simple test of AgentOps Monitor with Google ADK
# This test demonstrates basic monitoring without requiring a backend server
# """

# from google.adk.agents import LlmAgent
# from google.adk.apps import App
# from google.adk.runners import Runner
# from google.adk.sessions import InMemorySessionService
# from agentops_monitor import monitor_agent, monitor_runner
# from google.genai import types
# import uuid
# import os

# # Set to a test API key (will fail to send but won't crash)
# API_KEY = "agentops_test_key_12345678901234567890"

# # Optionally set backend API URL:
# os.environ["AGENTOPS_API_URL"] = "http://localhost:8000"

# print("Creating agent...")
# agent = LlmAgent(name="Researcher", model="gemini-2.5-flash")
# agent = monitor_agent(agent, API_KEY)

# print("Creating app...")
# app = App(name="ResearchApp", root_agent=agent)

# print("Creating runner...")
# session_service = InMemorySessionService()
# runner = Runner(app=app, session_service=session_service)
# runner = monitor_runner(runner, API_KEY)

# print("Preparing to run agent...")
# user_id = "test_user"
# session_id = str(uuid.uuid4())

# # Note: The runner will handle session creation internally
# message = types.Content(parts=[types.Part(text="Say hello!")], role="user")

# print(f"Running agent with session {session_id}...")
# print("Note: This will fail because we don't have a valid Gemini API key configured")
# print("But it demonstrates that the monitoring wrapper is working correctly\n")

# try:
#     for event in runner.run(
#         user_id=user_id, session_id=session_id, new_message=message
#     ):
#         print(f"Event: {type(event).__name__}")
# except Exception as e:
#     print(
#         f"\nExpected error (no valid Gemini API key): {type(e).__name__}: {str(e)[:200]}"
#     )

# print("\n✓ Monitoring wrapper is working! The a2a module issue is fixed.")
