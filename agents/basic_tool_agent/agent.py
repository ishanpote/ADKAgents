from datetime import datetime

from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm


def get_current_datetime():
    """Returns current date/time for tool calls."""
    return datetime.now().strftime(
        "Hello! Today is %A, %d %B %Y and the time is %I:%M %p."
    )

MODEL = "ollama/llama3"

root_agent = Agent(
    name="basic_tool_agent",
    model=LiteLlm(model=MODEL),
    instruction="""
        You are a helpful and friendly assistant.
        Greet the user warmly when the conversation begins.
        Respond to user questions in a polite and conversational way.
        
        If the user asks for the date or time, call the 'get_current_datetime' tool.
    """,
    tools=[get_current_datetime],
)

# Run a REPL-style chat
if __name__ == "__main__":
    while True:
        user_input = input("You: ")
        response = root_agent.chat(user_input)
        print("Agent:", response)