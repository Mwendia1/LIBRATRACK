import subprocess
import sys
import os

print("Starting Library Management Backend...")
print("Current directory:", os.getcwd())
print("API will be available at: http://localhost:8000")
print("API Documentation: http://localhost:8000/docs")
print("\nPress Ctrl+C to stop the server\n")

# Run uvicorn
subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"])