"""
Vercel Serverless Function Entry Point

This module serves as the entry point for the FastAPI app on Vercel.
Prisma client must be generated during build time.
"""
import sys
import os

# Set up the path to include the backend directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app
from src.main import app

# Export handler for Vercel
handler = app
