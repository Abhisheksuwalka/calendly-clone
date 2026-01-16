"""
Prisma database client and utilities.
"""
from prisma import Prisma

# Global Prisma client instance
prisma = Prisma()


async def connect_db():
    """Connect to database."""
    if not prisma.is_connected():
        await prisma.connect()


async def disconnect_db():
    """Disconnect from database."""
    if prisma.is_connected():
        await prisma.disconnect()


async def get_db() -> Prisma:
    """Get Prisma client (dependency injection for routes)."""
    return prisma
