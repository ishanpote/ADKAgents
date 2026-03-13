from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

MODEL = "ollama/llama3"

root_agent = Agent(
    name="basic_agent",
    model=LiteLlm(model=MODEL),
    instruction="""
        You are a helpful and friendly assistant.
        Greet the user warmly when the conversation begins.
        Respond to user questions in a polite and conversational way.

        Do not call tools.
        If asked for current date/time, clearly mention you cannot access
        real-time system clock in this runtime.
    """,
)

# Run a REPL-style chat
if __name__ == "__main__":
    while True:
        user_input = input("You: ")
        response = root_agent.chat(user_input)
        print("Agent:", response)