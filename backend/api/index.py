"""
Vercel Serverless Function Entry Point

This module ensures Prisma client is generated before the FastAPI app starts.
"""
import os
import sys
import subprocess

# Generate Prisma client at startup (required for Vercel)
def generate_prisma_client():
    """Generate Prisma client if not already generated."""
    try:
        # Try to import prisma to check if it's already generated
        from prisma import Prisma
        # Test if client is actually usable
        try:
            _ = Prisma()
            print("✅ Prisma client already generated")
            return True
        except RuntimeError as e:
            if "hasn't been generated yet" in str(e):
                pass  # Fall through to generation
            else:
                raise e
    except ImportError:
        pass  # Fall through to generation
    except RuntimeError as e:
        if "hasn't been generated yet" not in str(e):
            raise e
    
    print("🔧 Generating Prisma client...")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "prisma", "generate"],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(os.path.abspath(__file__)),
            timeout=60
        )
        if result.returncode == 0:
            print("✅ Prisma client generated successfully")
            return True
        else:
            print(f"❌ Prisma generate failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error generating Prisma client: {e}")
        return False

# Run Prisma generation
generate_prisma_client()

# Import the FastAPI app
from main import app
