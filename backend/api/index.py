"""
Minimal Vercel Serverless Function for Testing
Vercel Python expects the app to be named 'app' (for ASGI) or 'handler' (for WSGI)
"""
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "ok", "message": "minimal handler works"}

@app.get("/health")
async def health():
    return {"status": "ok"}
