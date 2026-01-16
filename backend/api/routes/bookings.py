"""
Bookings and Meetings API Router - Prisma Version
"""
from datetime import datetime, timedelta, date, timezone as dt_timezone
from typing import Optional
from calendar import monthrange
from fastapi import APIRouter, HTTPException, Query, status
from prisma import Prisma, Json

from core.database import prisma
from schemas import (
    BookingCreate,
    BookingResponse,
    BookingListResponse,
    CancelBookingRequest,
    TimeSlot,
    AvailableSlotsResponse,
    AvailableDatesResponse,
    PublicBookingPageResponse,
    PublicEventTypeResponse,
    PublicHostResponse,
    EventTypeResponse,
    MeetingNotesCreate,
)
from routes.event_types import ensure_default_user, DEFAULT_USER_ID, get_location_type_str


router = APIRouter(tags=["Bookings"])


def get_status_str(status) -> str:
    """Safely extract string value from Prisma enum or string."""
    if status is None:
        return "confirmed"
    if hasattr(status, 'value'):
        return status.value.lower()
    return str(status).lower()


# ============ Public Endpoints ============
# NOTE: The /public/{username}/{event_slug} route is defined at the END of this file
#       because it's a catch-all that would match paths like /public/bookings/{id}


@router.get("/public/available-dates", response_model=AvailableDatesResponse)
async def get_available_dates(
    event_type_id: str = Query(...),
    month: str = Query(..., pattern=r"^\d{4}-\d{2}$", description="Month in YYYY-MM format")
):
    """Get available dates for a month (for calendar view)."""
    # Get event type
    event_type = await prisma.eventtype.find_unique(where={"id": event_type_id})
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    if not event_type.isActive:
        raise HTTPException(status_code=400, detail="Event type is not active")
    
    # Parse month
    try:
        year, month_num = map(int, month.split("-"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format")
    
    # Get user's availability schedule
    schedule = await prisma.availabilityschedule.find_first(
        where={"userId": event_type.userId, "isDefault": True}
    )
    
    if not schedule:
        return AvailableDatesResponse(year=year, month=month_num, dates=[])
    
    # Get weekly hours
    weekly_hours_list = await prisma.weeklyhours.find_many(
        where={"scheduleId": schedule.id}
    )
    
    # Create a lookup for enabled days
    enabled_days = {}
    for wh in weekly_hours_list:
        if wh.isEnabled and wh.intervals:
            enabled_days[wh.dayOfWeek] = wh.intervals
    
    # Calculate min/max booking dates
    now = datetime.utcnow()
    min_date = now + timedelta(hours=event_type.minNoticeHours)
    max_date = now + timedelta(days=event_type.maxDaysAhead)
    
    # Get all dates in the month
    _, days_in_month = monthrange(year, month_num)
    available_dates = []
    
    for day in range(1, days_in_month + 1):
        check_date = date(year, month_num, day)
        check_datetime = datetime.combine(check_date, datetime.min.time())
        
        # Check if date is within booking window
        if check_datetime.date() < min_date.date() or check_datetime.date() > max_date.date():
            continue
        
        # Check if day of week is enabled (Python: Monday=0, Schema: Sunday=0)
        python_dow = check_date.weekday()
        schema_dow = (python_dow + 1) % 7
        
        if schema_dow in enabled_days:
            available_dates.append(check_date.strftime("%Y-%m-%d"))
    
    return AvailableDatesResponse(year=year, month=month_num, dates=available_dates)


@router.get("/public/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking_confirmation(booking_id: str):
    """Get booking confirmation details (public)."""
    booking = await prisma.booking.find_unique(
        where={"id": booking_id},
        include={"eventType": True}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    response = BookingResponse(
        id=booking.id,
        event_type_id=booking.eventTypeId,
        host_id=booking.hostId,
        start_time=booking.startTime,
        end_time=booking.endTime,
        invitee_timezone=booking.inviteeTimezone,
        invitee_name=booking.inviteeName,
        invitee_email=booking.inviteeEmail,
        guests=booking.guests if booking.guests else [],
        status=get_status_str(booking.status),
        cancelled_at=booking.cancelledAt,
        cancel_reason=booking.cancelReason,
        created_at=booking.createdAt,
        updated_at=booking.updatedAt
    )
    
    if booking.eventType:
        et = booking.eventType
        response.event_type = EventTypeResponse(
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
            updated_at=et.updatedAt
        )
    
    return response


@router.get("/public/slots", response_model=AvailableSlotsResponse)
async def get_available_slots(
    event_type_id: str = Query(...),
    date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    timezone: Optional[str] = Query(None)
):
    """Get available time slots for a specific date."""
    # Get event type
    event_type = await prisma.eventtype.find_unique(where={"id": event_type_id})
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    # Parse date
    try:
        slot_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    # Get user's availability schedule
    schedule = await prisma.availabilityschedule.find_first(
        where={"userId": event_type.userId, "isDefault": True}
    )
    
    if not schedule:
        return AvailableSlotsResponse(date=date, timezone=timezone or "UTC", slots=[])
    
    # Get weekly hours for the day of week (Python Monday=0, Schema Sunday=0)
    python_dow = slot_date.weekday()  # Monday=0
    # Convert: Python Monday(0) -> Schema Monday(1), Python Sunday(6) -> Schema Sunday(0)
    schema_dow = (python_dow + 1) % 7
    
    weekly_hours = await prisma.weeklyhours.find_first(
        where={"scheduleId": schedule.id, "dayOfWeek": schema_dow}
    )
    
    if not weekly_hours or not weekly_hours.isEnabled:
        return AvailableSlotsResponse(date=date, timezone=timezone or schedule.timezone, slots=[])
    
    # Get existing bookings for this date
    start_of_day = datetime.combine(slot_date, datetime.min.time())
    end_of_day = datetime.combine(slot_date, datetime.max.time())
    
    existing_bookings = await prisma.booking.find_many(
        where={
            "hostId": event_type.userId,
            "status": "CONFIRMED",
            "startTime": {"gte": start_of_day, "lte": end_of_day}
        }
    )
    
    # Generate slots
    slots = []
    duration = timedelta(minutes=event_type.durationMinutes)
    intervals = weekly_hours.intervals if weekly_hours.intervals else []
    
    for interval in intervals:
        start_time_str = interval.get("start_time", "09:00")
        end_time_str = interval.get("end_time", "17:00")
        
        start_hour, start_min = map(int, start_time_str.split(":"))
        end_hour, end_min = map(int, end_time_str.split(":"))
        
        current = datetime.combine(slot_date, datetime.min.time().replace(hour=start_hour, minute=start_min, tzinfo=dt_timezone.utc))
        interval_end = datetime.combine(slot_date, datetime.min.time().replace(hour=end_hour, minute=end_min, tzinfo=dt_timezone.utc))
        
        while current + duration <= interval_end:
            slot_end = current + duration
            
            # Check if slot overlaps with existing booking
            is_available = True
            for booking in existing_bookings:
                if not (slot_end <= booking.startTime or current >= booking.endTime):
                    is_available = False
                    break
            
            # Check minimum notice
            now = datetime.now(dt_timezone.utc)
            min_notice = timedelta(hours=event_type.minNoticeHours)
            if current < now + min_notice:
                is_available = False
            
            if is_available:
                slots.append(TimeSlot(
                    start_time=current.strftime("%H:%M"),
                    end_time=slot_end.strftime("%H:%M")
                ))
            
            # Move to next slot
            increment = min(30, event_type.durationMinutes)
            current += timedelta(minutes=increment)
    
    return AvailableSlotsResponse(
        date=date,
        timezone=timezone or schedule.timezone,
        slots=slots
    )


@router.post("/public/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(booking_data: BookingCreate):
    """Create a new booking."""
    # Get event type
    event_type = await prisma.eventtype.find_unique(where={"id": booking_data.event_type_id})
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    if not event_type.isActive:
        raise HTTPException(status_code=400, detail="Event type is not active")
    
    # Calculate end time
    end_time = booking_data.start_time + timedelta(minutes=event_type.durationMinutes)
    
    # Check for conflicts
    conflict = await prisma.booking.find_first(
        where={
            "hostId": event_type.userId,
            "status": "CONFIRMED",
            "startTime": {"lt": end_time},
            "endTime": {"gt": booking_data.start_time}
        }
    )
    
    if conflict:
        raise HTTPException(status_code=409, detail="Time slot is no longer available")
    
    # Create booking
    booking = await prisma.booking.create(
        data={
            "eventTypeId": event_type.id,
            "hostId": event_type.userId,
            "startTime": booking_data.start_time,
            "endTime": end_time,
            "inviteeTimezone": booking_data.timezone,
            "inviteeName": booking_data.invitee.name,
            "inviteeEmail": booking_data.invitee.email,
            "guests": Json(booking_data.guests),
            "status": "CONFIRMED"
        }
    )
    
    return BookingResponse(
        id=booking.id,
        event_type_id=booking.eventTypeId,
        host_id=booking.hostId,
        start_time=booking.startTime,
        end_time=booking.endTime,
        invitee_timezone=booking.inviteeTimezone,
        invitee_name=booking.inviteeName,
        invitee_email=booking.inviteeEmail,
        guests=booking.guests if booking.guests else [],
        status=get_status_str(booking.status),
        cancelled_at=booking.cancelledAt,
        cancel_reason=booking.cancelReason,
        created_at=booking.createdAt,
        updated_at=booking.updatedAt
    )


# ============ Host/Admin Endpoints ============

@router.get("/meetings", response_model=BookingListResponse)
async def list_meetings(
    status_filter: str = Query("upcoming", pattern="^(upcoming|past|all)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get meetings for the current user."""
    user = await ensure_default_user(prisma)
    
    now = datetime.utcnow()
    where_clause = {"hostId": user.id}
    order_by = {}
    
    if status_filter == "upcoming":
        where_clause["startTime"] = {"gt": now}
        where_clause["status"] = "CONFIRMED"
        order_by = {"startTime": "asc"}
    elif status_filter == "past":
        where_clause["startTime"] = {"lte": now}
        order_by = {"startTime": "desc"}
    else:
        order_by = {"startTime": "desc"}
    
    # Get total count
    total = await prisma.booking.count(where=where_clause)
    
    # Get bookings with pagination
    offset = (page - 1) * limit
    bookings = await prisma.booking.find_many(
        where=where_clause,
        order=order_by,
        skip=offset,
        take=limit,
        include={"eventType": True}
    )
    
    # Build response
    booking_responses = []
    for booking in bookings:
        response = BookingResponse(
            id=booking.id,
            event_type_id=booking.eventTypeId,
            host_id=booking.hostId,
            start_time=booking.startTime,
            end_time=booking.endTime,
            invitee_timezone=booking.inviteeTimezone,
            invitee_name=booking.inviteeName,
            invitee_email=booking.inviteeEmail,
            guests=booking.guests if booking.guests else [],
            status=get_status_str(booking.status),
            cancelled_at=booking.cancelledAt,
            cancel_reason=booking.cancelReason,
            created_at=booking.createdAt,
            updated_at=booking.updatedAt
        )
        
        if booking.eventType:
            et = booking.eventType
            response.event_type = EventTypeResponse(
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
                updated_at=et.updatedAt
            )
        
        booking_responses.append(response)
    
    return BookingListResponse(bookings=booking_responses, total=total)


@router.get("/meetings/{booking_id}", response_model=BookingResponse)
async def get_meeting_details(booking_id: str):
    """Get detailed information about a specific meeting."""
    user = await ensure_default_user(prisma)
    
    booking = await prisma.booking.find_first(
        where={"id": booking_id, "hostId": user.id},
        include={"eventType": True}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    response = BookingResponse(
        id=booking.id,
        event_type_id=booking.eventTypeId,
        host_id=booking.hostId,
        start_time=booking.startTime,
        end_time=booking.endTime,
        invitee_timezone=booking.inviteeTimezone,
        invitee_name=booking.inviteeName,
        invitee_email=booking.inviteeEmail,
        guests=booking.guests if booking.guests else [],
        status=get_status_str(booking.status),
        cancelled_at=booking.cancelledAt,
        cancel_reason=booking.cancelReason,
        created_at=booking.createdAt,
        updated_at=booking.updatedAt
    )
    
    if booking.eventType:
        et = booking.eventType
        response.event_type = EventTypeResponse(
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
            updated_at=et.updatedAt
        )
    
    return response


@router.post("/meetings/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_meeting(booking_id: str, cancel_data: CancelBookingRequest):
    """Cancel a meeting."""
    user = await ensure_default_user(prisma)
    
    booking = await prisma.booking.find_first(
        where={"id": booking_id, "hostId": user.id}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if get_status_str(booking.status) == "cancelled":
        raise HTTPException(status_code=400, detail="Meeting is already cancelled")
    
    # Cancel the booking
    updated = await prisma.booking.update(
        where={"id": booking_id},
        data={
            "status": "CANCELLED",
            "cancelledAt": datetime.utcnow(),
            "cancelReason": cancel_data.reason,
            "cancelledBy": "host"
        }
    )
    
    return BookingResponse(
        id=updated.id,
        event_type_id=updated.eventTypeId,
        host_id=updated.hostId,
        start_time=updated.startTime,
        end_time=updated.endTime,
        invitee_timezone=updated.inviteeTimezone,
        invitee_name=updated.inviteeName,
        invitee_email=updated.inviteeEmail,
        guests=updated.guests if updated.guests else [],
        status=get_status_str(updated.status),
        cancelled_at=updated.cancelledAt,
        cancel_reason=updated.cancelReason,
        created_at=updated.createdAt,
        updated_at=updated.updatedAt
    )


@router.put("/meetings/{booking_id}/notes", response_model=dict)
async def add_or_update_meeting_notes(booking_id: str, notes_data: MeetingNotesCreate):
    """Add or update notes for a meeting."""
    user = await ensure_default_user(prisma)
    
    # Verify booking exists and belongs to user
    booking = await prisma.booking.find_first(
        where={"id": booking_id, "hostId": user.id}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Try to find existing notes
    existing_notes = await prisma.meetingnotes.find_unique(
        where={"bookingId": booking_id}
    )
    
    if existing_notes:
        # Update existing notes
        notes = await prisma.meetingnotes.update(
            where={"id": existing_notes.id},
            data={"content": notes_data.content}
        )
    else:
        # Create new notes
        notes = await prisma.meetingnotes.create(
            data={
                "bookingId": booking_id,
                "content": notes_data.content
            }
        )
    
    return {
        "id": notes.id,
        "booking_id": notes.bookingId,
        "content": notes.content,
        "updated_at": notes.updatedAt.isoformat()
    }


@router.delete("/meetings/{booking_id}/notes", status_code=204)
async def delete_meeting_notes(booking_id: str):
    """Delete notes for a meeting."""
    user = await ensure_default_user(prisma)
    
    # Verify booking exists and belongs to user
    booking = await prisma.booking.find_first(
        where={"id": booking_id, "hostId": user.id}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Find and delete notes
    notes = await prisma.meetingnotes.find_unique(
        where={"bookingId": booking_id}
    )
    
    if not notes:
        raise HTTPException(status_code=404, detail="No notes found for this meeting")
    
    await prisma.meetingnotes.delete(where={"id": notes.id})
    return None


# ============ Catch-All Public Route (must be last) ============
# This route catches /public/{username}/{event_slug} and must be defined AFTER
# all other /public/* routes to avoid matching /public/available-dates etc.


@router.get("/public/{username}/{event_slug}", response_model=PublicBookingPageResponse)
async def get_public_booking_page(username: str, event_slug: str):
    """Get event type info for public booking page."""
    # Find user by username
    user = await prisma.user.find_unique(where={"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find event type by slug
    event_type = await prisma.eventtype.find_first(
        where={"userId": user.id, "slug": event_slug, "isActive": True}
    )
    
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    return PublicBookingPageResponse(
        event_type=PublicEventTypeResponse(
            id=event_type.id,
            name=event_type.name,
            slug=event_type.slug,
            duration_minutes=event_type.durationMinutes,
            color=event_type.color,
            description=event_type.description,
            location_type=get_location_type_str(event_type.locationType)
        ),
        host=PublicHostResponse(
            name=user.name,
            username=user.username
        )
    )
