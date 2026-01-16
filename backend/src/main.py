"""
Calendly Clone API - Render Entry Point

FastAPI backend with Prisma ORM and PostgreSQL database.
Imports shared code from app/ package.
Features hot-reload for development.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_db, disconnect_db
from app.routes import event_types_router, availability_router, bookings_router, users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - connect/disconnect database."""
    # Startup
    print("🚀 Starting Calendly Clone API...")
    await connect_db()
    print("✅ Database connected!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")
    await disconnect_db()
    print("✅ Database disconnected!")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="A scheduling/booking API that replicates Calendly's functionality",
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    redirect_slashes=False
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def normalize_path(request, call_next):
    """
    Middleware to normalize URL paths by removing double slashes.
    This helps prevent 307 redirects on preflight requests when the frontend 
    accidentally sends double slashes (e.g. //event-types).
    """
    if "//" in request.url.path:
        request.scope["path"] = request.url.path.replace("//", "/")
    response = await call_next(request)
    return response


# ============ Health Check ============

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.api_version,
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# ============ Include Routers ============

app.include_router(event_types_router, prefix="/api/v1")
app.include_router(availability_router, prefix="/api/v1")
app.include_router(bookings_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")


# ============ Run with Uvicorn ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        reload_dirs=["app"]
    )