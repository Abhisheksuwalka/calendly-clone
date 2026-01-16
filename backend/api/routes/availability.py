"""
Availability API Router - Prisma Version
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from prisma import Prisma, Json

from core.database import prisma
from schemas import (
    AvailabilityScheduleResponse,
    AvailabilityScheduleUpdate,
    WeeklyHoursResponse,
    TimeInterval,
    ScheduleListItem,
    ScheduleListResponse,
    ScheduleCreate,
    DateOverrideCreate,
    DateOverrideResponse,
    TimezoneUpdate,
)
from routes.event_types import ensure_default_user, DEFAULT_USER_ID


router = APIRouter(prefix="/availability", tags=["Availability"])

DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


async def get_or_create_default_schedule(db: Prisma, user_id: str):
    """Get or create the default availability schedule for a user."""
    schedule = await db.availabilityschedule.find_first(
        where={"userId": user_id, "isDefault": True},
        include={"weeklyHours": True}
    )
    
    if not schedule:
        # Create default schedule
        schedule = await db.availabilityschedule.create(
            data={
                "userId": user_id,
                "name": "Working Hours",
                "timezone": "Asia/Kolkata",
                "isDefault": True
            }
        )
        
        # Create weekly hours (Mon-Fri: 9am-5pm)
        for day in range(7):
            is_enabled = 1 <= day <= 5  # Monday to Friday
            intervals = [{"start_time": "09:00", "end_time": "17:00"}] if is_enabled else []
            await db.weeklyhours.create(
                data={
                    "scheduleId": schedule.id,
                    "dayOfWeek": day,
                    "isEnabled": is_enabled,
                    "intervals": Json(intervals)
                }
            )
        
        # Refetch with weekly hours
        schedule = await db.availabilityschedule.find_first(
            where={"id": schedule.id},
            include={"weeklyHours": True}
        )
    
    return schedule


@router.get("/schedule", response_model=AvailabilityScheduleResponse)
async def get_availability_schedule():
    """Get the current user's availability schedule."""
    user = await ensure_default_user(prisma)
    schedule = await get_or_create_default_schedule(prisma, user.id)
    
    # Build weekly hours response
    weekly_hours_response = []
    weekly_hours = await prisma.weeklyhours.find_many(
        where={"scheduleId": schedule.id},
        order={"dayOfWeek": "asc"}
    )
    
    for wh in weekly_hours:
        intervals_data = wh.intervals if wh.intervals else []
        intervals = [TimeInterval(**interval) for interval in intervals_data]
        weekly_hours_response.append(WeeklyHoursResponse(
            id=wh.id,
            day_of_week=wh.dayOfWeek,
            day_name=DAY_NAMES[wh.dayOfWeek],
            is_enabled=wh.isEnabled,
            intervals=intervals
        ))
    
    return AvailabilityScheduleResponse(
        id=schedule.id,
        user_id=schedule.userId,
        name=schedule.name,
        timezone=schedule.timezone,
        is_default=schedule.isDefault,
        weekly_hours=weekly_hours_response,
        created_at=schedule.createdAt,
        updated_at=schedule.updatedAt
    )


@router.put("/schedule", response_model=AvailabilityScheduleResponse)
async def update_availability_schedule(update_data: AvailabilityScheduleUpdate):
    """Update the user's availability schedule."""
    user = await ensure_default_user(prisma)
    schedule = await get_or_create_default_schedule(prisma, user.id)
    
    # Update timezone if provided
    if update_data.timezone:
        await prisma.availabilityschedule.update(
            where={"id": schedule.id},
            data={"timezone": update_data.timezone}
        )
    
    # Update weekly hours if provided
    if update_data.weekly_hours:
        for wh_update in update_data.weekly_hours:
            # Validate intervals: ensure start_time < end_time
            for interval in wh_update.intervals:
                start_parts = interval.start_time.split(":")
                end_parts = interval.end_time.split(":")
                start_minutes = int(start_parts[0]) * 60 + int(start_parts[1])
                end_minutes = int(end_parts[0]) * 60 + int(end_parts[1])
                if start_minutes >= end_minutes:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Invalid interval for {DAY_NAMES[wh_update.day_of_week]}: start_time must be before end_time"
                    )
            
            existing = await prisma.weeklyhours.find_first(
                where={
                    "scheduleId": schedule.id,
                    "dayOfWeek": wh_update.day_of_week
                }
            )
            
            intervals_json = [interval.model_dump() for interval in wh_update.intervals]
            
            if existing:
                await prisma.weeklyhours.update(
                    where={"id": existing.id},
                    data={
                        "isEnabled": wh_update.is_enabled,
                        "intervals": Json(intervals_json)
                    }
                )
            else:
                await prisma.weeklyhours.create(
                    data={
                        "scheduleId": schedule.id,
                        "dayOfWeek": wh_update.day_of_week,
                        "isEnabled": wh_update.is_enabled,
                        "intervals": Json(intervals_json)
                    }
                )
    
    # Refetch and return
    schedule = await prisma.availabilityschedule.find_first(
        where={"id": schedule.id}
    )
    
    weekly_hours = await prisma.weeklyhours.find_many(
        where={"scheduleId": schedule.id},
        order={"dayOfWeek": "asc"}
    )
    
    weekly_hours_response = []
    for wh in weekly_hours:
        intervals_data = wh.intervals if wh.intervals else []
        intervals = [TimeInterval(**interval) for interval in intervals_data]
        weekly_hours_response.append(WeeklyHoursResponse(
            id=wh.id,
            day_of_week=wh.dayOfWeek,
            day_name=DAY_NAMES[wh.dayOfWeek],
            is_enabled=wh.isEnabled,
            intervals=intervals
        ))
    
    return AvailabilityScheduleResponse(
        id=schedule.id,
        user_id=schedule.userId,
        name=schedule.name,
        timezone=schedule.timezone,
        is_default=schedule.isDefault,
        weekly_hours=weekly_hours_response,
        created_at=schedule.createdAt,
        updated_at=schedule.updatedAt
    )


# ============ Additional Availability Endpoints ============

@router.get("/schedules", response_model=ScheduleListResponse)
async def list_schedules():
    """Get all availability schedules for the current user."""
    user = await ensure_default_user(prisma)
    
    schedules = await prisma.availabilityschedule.find_many(
        where={"userId": user.id},
        order={"createdAt": "desc"}
    )
    
    return ScheduleListResponse(
        schedules=[
            ScheduleListItem(
                id=s.id,
                name=s.name,
                timezone=s.timezone,
                is_default=s.isDefault
            ) for s in schedules
        ]
    )


@router.post("/schedules", response_model=AvailabilityScheduleResponse, status_code=201)
async def create_schedule(schedule_data: ScheduleCreate):
    """Create a new availability schedule."""
    user = await ensure_default_user(prisma)
    
    # If setting as default, unset current default
    if schedule_data.is_default:
        await prisma.availabilityschedule.update_many(
            where={"userId": user.id, "isDefault": True},
            data={"isDefault": False}
        )
    
    # Create the schedule
    schedule = await prisma.availabilityschedule.create(
        data={
            "userId": user.id,
            "name": schedule_data.name,
            "timezone": schedule_data.timezone,
            "isDefault": schedule_data.is_default
        }
    )
    
    # Create default weekly hours (Mon-Fri: 9am-5pm)
    for day in range(7):
        is_enabled = 1 <= day <= 5  # Monday to Friday
        intervals = [{"start_time": "09:00", "end_time": "17:00"}] if is_enabled else []
        await prisma.weeklyhours.create(
            data={
                "scheduleId": schedule.id,
                "dayOfWeek": day,
                "isEnabled": is_enabled,
                "intervals": Json(intervals)
            }
        )
    
    # Refetch with weekly hours
    weekly_hours = await prisma.weeklyhours.find_many(
        where={"scheduleId": schedule.id},
        order={"dayOfWeek": "asc"}
    )
    
    weekly_hours_response = []
    for wh in weekly_hours:
        intervals_data = wh.intervals if wh.intervals else []
        weekly_hours_response.append(WeeklyHoursResponse(
            id=wh.id,
            day_of_week=wh.dayOfWeek,
            day_name=DAY_NAMES[wh.dayOfWeek],
            is_enabled=wh.isEnabled,
            intervals=[TimeInterval(**interval) for interval in intervals_data]
        ))
    
    return AvailabilityScheduleResponse(
        id=schedule.id,
        user_id=schedule.userId,
        name=schedule.name,
        timezone=schedule.timezone,
        is_default=schedule.isDefault,
        weekly_hours=weekly_hours_response,
        created_at=schedule.createdAt,
        updated_at=schedule.updatedAt
    )


@router.post("/date-overrides", response_model=DateOverrideResponse, status_code=201)
async def add_date_override(override_data: DateOverrideCreate):
    """Add a date-specific availability override."""
    user = await ensure_default_user(prisma)
    
    # Get schedule (use provided or default)
    if override_data.schedule_id:
        schedule = await prisma.availabilityschedule.find_first(
            where={"id": override_data.schedule_id, "userId": user.id}
        )
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
    else:
        schedule = await get_or_create_default_schedule(prisma, user.id)
    
    # Check if override already exists for this date
    from datetime import datetime as dt
    specific_date = dt.strptime(override_data.specific_date, "%Y-%m-%d")
    
    existing = await prisma.dateoverride.find_first(
        where={"scheduleId": schedule.id, "specificDate": specific_date}
    )
    
    intervals_json = [interval.model_dump() for interval in override_data.intervals]
    
    if existing:
        # Update existing override
        override = await prisma.dateoverride.update(
            where={"id": existing.id},
            data={"intervals": Json(intervals_json)}
        )
    else:
        # Create new override
        override = await prisma.dateoverride.create(
            data={
                "scheduleId": schedule.id,
                "specificDate": specific_date,
                "intervals": Json(intervals_json)
            }
        )
    
    return DateOverrideResponse(
        id=override.id,
        schedule_id=override.scheduleId,
        specific_date=override.specificDate.strftime("%Y-%m-%d"),
        intervals=[TimeInterval(**i) for i in override.intervals] if override.intervals else [],
        created_at=override.createdAt
    )


@router.delete("/date-overrides/{override_id}", status_code=204)
async def delete_date_override(override_id: str):
    """Delete a date override."""
    user = await ensure_default_user(prisma)
    
    # Verify the override belongs to user's schedule
    override = await prisma.dateoverride.find_unique(
        where={"id": override_id},
        include={"schedule": True}
    )
    
    if not override:
        raise HTTPException(status_code=404, detail="Date override not found")
    
    if override.schedule.userId != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await prisma.dateoverride.delete(where={"id": override_id})
    return None


@router.patch("/schedule/timezone", response_model=dict)
async def update_timezone(timezone_data: TimezoneUpdate):
    """Update the default schedule's timezone."""
    user = await ensure_default_user(prisma)
    schedule = await get_or_create_default_schedule(prisma, user.id)
    
    # Validate timezone (basic check)
    import pytz
    try:
        pytz.timezone(timezone_data.timezone)
    except pytz.UnknownTimeZoneError:
        raise HTTPException(status_code=400, detail="Invalid timezone")
    
    await prisma.availabilityschedule.update(
        where={"id": schedule.id},
        data={"timezone": timezone_data.timezone}
    )
    
    return {"timezone": timezone_data.timezone}

