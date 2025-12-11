import os
import json
import urllib.request
import urllib.error

# Manually read .env since we want to avoid external dependencies for this check
api_key = None
try:
    with open(r'urs\backend\.env', 'r') as f:
        for line in f:
            if line.startswith('GOOGLE_API_KEY='):
                api_key = line.strip().split('=')[1]
                break
            elif line.startswith('API_KEY='):
                api_key = line.strip().split('=')[1]
                break
except Exception as e:
    print(f"Error reading .env: {e}")

if not api_key:
    print("Error: API key not found in .env file.")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    with urllib.request.urlopen(url) as response:
        if response.status == 200:
            data = json.loads(response.read().decode())
            print("Available models:")
            for model in data.get('models', []):
                if 'generateContent' in model.get('supportedGenerationMethods', []):
                    print(f"- {model['name']}")
        else:
            print(f"Error: {response.status}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.read().decode()}")
except Exception as e:
    print(f"Exception: {e}")
