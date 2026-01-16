"""
Vercel Serverless Function Entry Point

This module serves as the entry point for the FastAPI app on Vercel.
"""
import sys
import os

# Set up the path to include the backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Import the FastAPI app
from src.main import app
