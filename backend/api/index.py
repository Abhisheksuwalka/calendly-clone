"""
Minimal Vercel Serverless Function for Testing
"""
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "ok", "message": "minimal handler works"}

@app.get("/health")
async def health():
    return {"status": "ok"}

# Export for Vercel
handler = app
