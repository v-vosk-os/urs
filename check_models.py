import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('urs/backend/.env')

api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("API_KEY")

if not api_key:
    print("Error: API key not found in environment variables.")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print("Available models:")
        for model in data.get('models', []):
            if 'generateContent' in model.get('supportedGenerationMethods', []):
                print(f"- {model['name']}")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Exception: {e}")
