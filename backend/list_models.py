import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

print("Testing generate_content with gemini-2.5-flash:")
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say 'Hello World' in French."
    )
    print("Response:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
