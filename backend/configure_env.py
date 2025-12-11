import os
import shutil

def configure_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    example_path = os.path.join(os.path.dirname(__file__), 'env_example.txt')
    
    # Read the example file which we already updated with the keys
    if os.path.exists(example_path):
        with open(example_path, 'r') as f:
            content = f.read()
            
        # Write to .env
        with open(env_path, 'w') as f:
            f.write(content)
            
        print(f"Successfully configured .env at {env_path}")
        print("API keys have been set.")
    else:
        print(f"Error: {example_path} not found.")

if __name__ == "__main__":
    configure_env()
