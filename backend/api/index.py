"""
Vercel Serverless Function Entry Point - Debug Version

This module serves as the entry point for the FastAPI app on Vercel.
"""
import sys
import os
import traceback

# Set up the path to include the backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Try to import and show errors
try:
    # First, check if prisma client exists
    try:
        from prisma import Prisma
        prisma_status = "Prisma client import successful"
    except Exception as e:
        prisma_status = f"Prisma import error: {e}"
    
    # Try importing the app
    from src.main import app
    
except Exception as e:
    # Create a minimal debug app to show what's wrong
    from fastapi import FastAPI
    app = FastAPI()
    
    error_message = traceback.format_exc()
    
    @app.get("/")
    @app.get("/health")
    async def debug_error():
        return {
            "error": "Failed to import main app",
            "details": str(e),
            "traceback": error_message,
            "sys_path": sys.path[:5],
            "backend_dir": backend_dir,
            "cwd": os.getcwd(),
            "files_in_backend": os.listdir(backend_dir) if os.path.exists(backend_dir) else "dir not found"
        }

# Export for Vercel
handler = app
