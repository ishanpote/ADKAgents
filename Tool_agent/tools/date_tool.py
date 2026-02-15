from datetime import datetime
from google.adk.tools import FunctionTool

def get_current_datetime():
    """Returns the current date and time in a friendly format."""
    return datetime.now().strftime("Hello! Today is %A, %d %B %Y and the time is %I:%M %p.")

# Register the tool (only pass the function!)
datetime_tool = FunctionTool(get_current_datetime)