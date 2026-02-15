from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

MODEL = "ollama/llama3"

root_agent = Agent(
    name="basicagent",
    model=LiteLlm(model=MODEL),
        description="Greeting agent",
        instruction="""
        You are a helpful assistant that greets user.
        Ask for the user's name and greet them by name.'
        """,
        )