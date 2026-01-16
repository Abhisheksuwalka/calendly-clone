"""App routes module - exports all routers."""
from app.routes.event_types import router as event_types_router
from app.routes.availability import router as availability_router
from app.routes.bookings import router as bookings_router
from app.routes.users import router as users_router

__all__ = [
    "event_types_router",
    "availability_router", 
    "bookings_router",
    "users_router",
]
