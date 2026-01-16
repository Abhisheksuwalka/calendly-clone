"""
Vercel Serverless Function Entry Point

This module ensures Prisma client is generated before the FastAPI app starts.
Required for Vercel deployment where the Prisma client needs to be generated at runtime.
"""
import subprocess
import sys
import os

# Set up the path to include the backend directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Generate Prisma client at startup (required for Vercel)
def generate_prisma_client():
    """Generate Prisma client if not already generated."""
    try:
        # Try to import prisma to check if it's already generated
        from prisma import Prisma
        # If import succeeds, client is already generated
        print("✅ Prisma client already generated")
    except RuntimeError as e:
        if "hasn't been generated yet" in str(e):
            print("🔧 Generating Prisma client...")
            result = subprocess.run(
                [sys.executable, "-m", "prisma", "generate"],
                capture_output=True,
                text=True,
                cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
            if result.returncode == 0:
                print("✅ Prisma client generated successfully")
            else:
                print(f"❌ Error generating Prisma client: {result.stderr}")
                raise RuntimeError(f"Failed to generate Prisma client: {result.stderr}")
        else:
            raise e

# Run Prisma generation
generate_prisma_client()

# Now import the FastAPI app
from src.main import app
