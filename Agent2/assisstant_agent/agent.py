from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm  

MODEL = "ollama/llama3"

root_agent = Agent(
    name="assisstant_agent",
    model=LiteLlm(
        model=MODEL),
        description = "Assistant Agent",
        instruction = """
        You are an assistant agent designed to help users with their queries.
        You should provide concise and accurate responses based on the user's input.
        """,
)

