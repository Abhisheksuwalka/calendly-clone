"""
Event Types API Router - Prisma Version
"""
import re
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from prisma import Prisma

from app.core.database import get_db, prisma
from app.schemas import (
    EventTypeCreate,
    EventTypeUpdate,
    EventTypeResponse,
    EventTypeListResponse,
)

router = APIRouter(prefix="/event-types", tags=["Event Types"])

# Default user constants for development (no auth)
DEFAULT_USER_ID = "default-user-001"
DEFAULT_USERNAME = "abhishek"


async def ensure_default_user(db: Prisma):
    """Ensure default user exists for development."""
    user = await db.user.find_unique(where={"id": DEFAULT_USER_ID})
    if not user:
        user = await db.user.create(
            data={
                "id": DEFAULT_USER_ID,
                "username": DEFAULT_USERNAME,
                "name": "Abhishek Suwalka",
                "email": "abhishek.s22@iiits.in",
                "timezone": "Asia/Kolkata"
            }
        )
    return user


def generate_slug(name: str) -> str:
    """Generate URL-safe slug from name."""
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')


def get_location_type_str(location_type) -> str:
    """Safely extract string value from Prisma enum or string."""
    if location_type is None:
        return "zoom"
    if hasattr(location_type, 'value'):
        return location_type.value.lower()
    return str(location_type).lower()


@router.get("", response_model=EventTypeListResponse)
async def list_event_types(active_only: bool = False):
    """Get all event types for the current user."""
    user = await ensure_default_user(prisma)
    
    where_clause = {"userId": user.id}
    if active_only:
        where_clause["isActive"] = True
    
    event_types = await prisma.eventtype.find_many(
        where=where_clause,
        order={"createdAt": "desc"}
    )
    
    result = []
    for et in event_types:
        result.append(EventTypeResponse(
            id=et.id,
            user_id=et.userId,
            name=et.name,
            slug=et.slug,
            duration_minutes=et.durationMinutes,
            color=et.color,
            description=et.description,
            location_type=get_location_type_str(et.locationType),
            location_details=et.locationDetails,
            buffer_before_minutes=et.bufferBeforeMinutes,
            buffer_after_minutes=et.bufferAfterMinutes,
            min_notice_hours=et.minNoticeHours,
            max_days_ahead=et.maxDaysAhead,
            is_active=et.isActive,
            created_at=et.createdAt,
            updated_at=et.updatedAt,
            booking_url=f"/{user.username}/{et.slug}"
        ))
    
    return EventTypeListResponse(event_types=result, total=len(result))


@router.get("/{event_type_id}", response_model=EventTypeResponse)
async def get_event_type(event_type_id: str):
    """Get a specific event type by ID."""
    user = await ensure_default_user(prisma)
    
    event_type = await prisma.eventtype.find_first(
        where={"id": event_type_id, "userId": user.id}
    )
    
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    return EventTypeResponse(
        id=event_type.id,
        user_id=event_type.userId,
        name=event_type.name,
        slug=event_type.slug,
        duration_minutes=event_type.durationMinutes,
        color=event_type.color,
        description=event_type.description,
        location_type=get_location_type_str(event_type.locationType),
        location_details=event_type.locationDetails,
        buffer_before_minutes=event_type.bufferBeforeMinutes,
        buffer_after_minutes=event_type.bufferAfterMinutes,
        min_notice_hours=event_type.minNoticeHours,
        max_days_ahead=event_type.maxDaysAhead,
        is_active=event_type.isActive,
        created_at=event_type.createdAt,
        updated_at=event_type.updatedAt,
        booking_url=f"/{user.username}/{event_type.slug}"
    )


@router.post("", response_model=EventTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_event_type(event_type_data: EventTypeCreate):
    """Create a new event type."""
    user = await ensure_default_user(prisma)
    
    # Generate slug if not provided
    slug = event_type_data.slug or generate_slug(event_type_data.name)
    
    # Check for duplicate slug and make unique
    existing = await prisma.eventtype.find_first(
        where={"userId": user.id, "slug": slug}
    )
    
    if existing:
        base_slug = slug
        counter = 1
        while existing:
            slug = f"{base_slug}-{counter}"
            existing = await prisma.eventtype.find_first(
                where={"userId": user.id, "slug": slug}
            )
            counter += 1
    
    # Map location type string to enum
    location_type_map = {
        "zoom": "ZOOM",
        "phone": "PHONE",
        "in_person": "IN_PERSON",
        "google_meet": "GOOGLE_MEET",
        "custom": "CUSTOM"
    }
    location_type = location_type_map.get(event_type_data.location_type.lower(), "ZOOM")
    
    # Create event type
    event_type = await prisma.eventtype.create(
        data={
            "userId": user.id,
            "name": event_type_data.name,
            "slug": slug,
            "durationMinutes": event_type_data.duration_minutes,
            "color": event_type_data.color,
            "description": event_type_data.description,
            "locationType": location_type,
            "locationDetails": event_type_data.location_details,
            "bufferBeforeMinutes": event_type_data.buffer_before_minutes,
            "bufferAfterMinutes": event_type_data.buffer_after_minutes,
            "minNoticeHours": event_type_data.min_notice_hours,
            "maxDaysAhead": event_type_data.max_days_ahead,
            "isActive": event_type_data.is_active
        }
    )
    
    return EventTypeResponse(
        id=event_type.id,
        user_id=event_type.userId,
        name=event_type.name,
        slug=event_type.slug,
        duration_minutes=event_type.durationMinutes,
        color=event_type.color,
        description=event_type.description,
        location_type=get_location_type_str(event_type.locationType),
        location_details=event_type.locationDetails,
        buffer_before_minutes=event_type.bufferBeforeMinutes,
        buffer_after_minutes=event_type.bufferAfterMinutes,
        min_notice_hours=event_type.minNoticeHours,
        max_days_ahead=event_type.maxDaysAhead,
        is_active=event_type.isActive,
        created_at=event_type.createdAt,
        updated_at=event_type.updatedAt,
        booking_url=f"/{user.username}/{event_type.slug}"
    )


@router.put("/{event_type_id}", response_model=EventTypeResponse)
async def update_event_type(event_type_id: str, update_data: EventTypeUpdate):
    """Update an existing event type."""
    user = await ensure_default_user(prisma)
    
    event_type = await prisma.eventtype.find_first(
        where={"id": event_type_id, "userId": user.id}
    )
    
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    # Build update data
    update_dict = {}
    if update_data.name is not None:
        update_dict["name"] = update_data.name
    if update_data.duration_minutes is not None:
        update_dict["durationMinutes"] = update_data.duration_minutes
    if update_data.color is not None:
        update_dict["color"] = update_data.color
    if update_data.description is not None:
        update_dict["description"] = update_data.description
    if update_data.location_type is not None:
        location_map = {"zoom": "ZOOM", "phone": "PHONE", "in_person": "IN_PERSON", "google_meet": "GOOGLE_MEET", "custom": "CUSTOM"}
        update_dict["locationType"] = location_map.get(update_data.location_type.lower(), "ZOOM")
    if update_data.location_details is not None:
        update_dict["locationDetails"] = update_data.location_details
    if update_data.buffer_before_minutes is not None:
        update_dict["bufferBeforeMinutes"] = update_data.buffer_before_minutes
    if update_data.buffer_after_minutes is not None:
        update_dict["bufferAfterMinutes"] = update_data.buffer_after_minutes
    if update_data.min_notice_hours is not None:
        update_dict["minNoticeHours"] = update_data.min_notice_hours
    if update_data.max_days_ahead is not None:
        update_dict["maxDaysAhead"] = update_data.max_days_ahead
    if update_data.is_active is not None:
        update_dict["isActive"] = update_data.is_active
    
    updated = await prisma.eventtype.update(
        where={"id": event_type_id},
        data=update_dict
    )
    
    return EventTypeResponse(
        id=updated.id,
        user_id=updated.userId,
        name=updated.name,
        slug=updated.slug,
        duration_minutes=updated.durationMinutes,
        color=updated.color,
        description=updated.description,
        location_type=get_location_type_str(updated.locationType),
        location_details=updated.locationDetails,
        buffer_before_minutes=updated.bufferBeforeMinutes,
        buffer_after_minutes=updated.bufferAfterMinutes,
        min_notice_hours=updated.minNoticeHours,
        max_days_ahead=updated.maxDaysAhead,
        is_active=updated.isActive,
        created_at=updated.createdAt,
        updated_at=updated.updatedAt,
        booking_url=f"/{user.username}/{updated.slug}"
    )


@router.delete("/{event_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_type(event_type_id: str):
    """Delete an event type and all associated bookings."""
    user = await ensure_default_user(prisma)
    
    event_type = await prisma.eventtype.find_first(
        where={"id": event_type_id, "userId": user.id}
    )
    
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    # First, delete all bookings associated with this event type
    await prisma.booking.delete_many(where={"eventTypeId": event_type_id})
    
    # Now delete the event type
    await prisma.eventtype.delete(where={"id": event_type_id})
    return None


@router.patch("/{event_type_id}/toggle", response_model=EventTypeResponse)
async def toggle_event_type(event_type_id: str):
    """Toggle event type active status."""
    user = await ensure_default_user(prisma)
    
    event_type = await prisma.eventtype.find_first(
        where={"id": event_type_id, "userId": user.id}
    )
    
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    # Toggle the is_active status
    updated = await prisma.eventtype.update(
        where={"id": event_type_id},
        data={"isActive": not event_type.isActive}
    )
    
    return EventTypeResponse(
        id=updated.id,
        user_id=updated.userId,
        name=updated.name,
        slug=updated.slug,
        duration_minutes=updated.durationMinutes,
        color=updated.color,
        description=updated.description,
        location_type=get_location_type_str(updated.locationType),
        location_details=updated.locationDetails,
        buffer_before_minutes=updated.bufferBeforeMinutes,
        buffer_after_minutes=updated.bufferAfterMinutes,
        min_notice_hours=updated.minNoticeHours,
        max_days_ahead=updated.maxDaysAhead,
        is_active=updated.isActive,
        created_at=updated.createdAt,
        updated_at=updated.updatedAt,
        booking_url=f"/{user.username}/{updated.slug}"
    )


@router.post("/{event_type_id}/duplicate", response_model=EventTypeResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_event_type(event_type_id: str):
    """Duplicate an event type with (Copy) suffix."""
    user = await ensure_default_user(prisma)
    
    original = await prisma.eventtype.find_first(
        where={"id": event_type_id, "userId": user.id}
    )
    
    if not original:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    # Generate new name and slug
    new_name = f"{original.name} (Copy)"
    new_slug = generate_slug(new_name)
    
    # Ensure unique slug
    existing = await prisma.eventtype.find_first(
        where={"userId": user.id, "slug": new_slug}
    )
    if existing:
        counter = 1
        base_slug = new_slug
        while existing:
            new_slug = f"{base_slug}-{counter}"
            existing = await prisma.eventtype.find_first(
                where={"userId": user.id, "slug": new_slug}
            )
            counter += 1
    
    # Create the duplicate
    duplicate = await prisma.eventtype.create(
        data={
            "userId": user.id,
            "name": new_name,
            "slug": new_slug,
            "durationMinutes": original.durationMinutes,
            "color": original.color,
            "description": original.description,
            "locationType": original.locationType,
            "locationDetails": original.locationDetails,
            "bufferBeforeMinutes": original.bufferBeforeMinutes,
            "bufferAfterMinutes": original.bufferAfterMinutes,
            "minNoticeHours": original.minNoticeHours,
            "maxDaysAhead": original.maxDaysAhead,
            "isActive": True  # Duplicates are active by default
        }
    )
    
    return EventTypeResponse(
        id=duplicate.id,
        user_id=duplicate.userId,
        name=duplicate.name,
        slug=duplicate.slug,
        duration_minutes=duplicate.durationMinutes,
        color=duplicate.color,
        description=duplicate.description,
        location_type=get_location_type_str(duplicate.locationType),
        location_details=duplicate.locationDetails,
        buffer_before_minutes=duplicate.bufferBeforeMinutes,
        buffer_after_minutes=duplicate.bufferAfterMinutes,
        min_notice_hours=duplicate.minNoticeHours,
        max_days_ahead=duplicate.maxDaysAhead,
        is_active=duplicate.isActive,
        created_at=duplicate.createdAt,
        updated_at=duplicate.updatedAt,
        booking_url=f"/{user.username}/{duplicate.slug}"
    )
