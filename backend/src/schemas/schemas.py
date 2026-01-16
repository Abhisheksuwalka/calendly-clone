"""
Pydantic schemas for request/response validation.
"""
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ============ Time Interval Schema ============
class TimeInterval(BaseModel):
    """Time interval for availability."""
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", examples=["09:00"])
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", examples=["17:00"])


# ============ User Schemas ============
class UserBase(BaseModel):
    """Base user schema."""
    username: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    timezone: str = Field(default="UTC", max_length=50)


class UserCreate(UserBase):
    """Schema for creating a user."""
    pass


class UserResponse(UserBase):
    """Schema for user response."""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Event Type Schemas ============
class EventTypeBase(BaseModel):
    """Base event type schema."""
    name: str = Field(..., min_length=1, max_length=100)
    duration_minutes: int = Field(default=30, ge=15, le=480)
    color: str = Field(default="#8B5CF6", pattern=r"^#[0-9A-Fa-f]{6}$")
    description: Optional[str] = None
    location_type: str = Field(default="zoom")
    location_details: Optional[str] = None
    buffer_before_minutes: int = Field(default=0, ge=0)
    buffer_after_minutes: int = Field(default=0, ge=0)
    min_notice_hours: int = Field(default=4, ge=0)
    max_days_ahead: int = Field(default=60, ge=1, le=365)
    is_active: bool = True


class EventTypeCreate(EventTypeBase):
    """Schema for creating an event type."""
    slug: Optional[str] = None  # Auto-generated if not provided
    
    @field_validator('slug', mode='before')
    @classmethod
    def generate_slug(cls, v, info):
        if v:
            # Clean the provided slug
            return re.sub(r'[^a-z0-9-]', '', v.lower().replace(' ', '-'))
        return None  # Will be generated from name


class EventTypeUpdate(BaseModel):
    """Schema for updating an event type."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    description: Optional[str] = None
    location_type: Optional[str] = None
    location_details: Optional[str] = None
    buffer_before_minutes: Optional[int] = Field(None, ge=0)
    buffer_after_minutes: Optional[int] = Field(None, ge=0)
    min_notice_hours: Optional[int] = Field(None, ge=0)
    max_days_ahead: Optional[int] = Field(None, ge=1, le=365)
    is_active: Optional[bool] = None


class EventTypeResponse(EventTypeBase):
    """Schema for event type response."""
    id: str
    user_id: str
    slug: str
    created_at: datetime
    updated_at: datetime
    booking_url: Optional[str] = None

    class Config:
        from_attributes = True


class EventTypeListResponse(BaseModel):
    """Schema for listing event types."""
    event_types: List[EventTypeResponse]
    total: int


# ============ Availability Schemas ============
class WeeklyHoursBase(BaseModel):
    """Base weekly hours schema."""
    day_of_week: int = Field(..., ge=0, le=6)
    is_enabled: bool = True
    intervals: List[TimeInterval] = []


class WeeklyHoursResponse(WeeklyHoursBase):
    """Response schema for weekly hours."""
    id: str
    day_name: str = ""

    class Config:
        from_attributes = True


class AvailabilityScheduleBase(BaseModel):
    """Base availability schedule schema."""
    name: str = Field(default="Working Hours", max_length=100)
    timezone: str = Field(default="UTC", max_length=50)
    is_default: bool = False


class AvailabilityScheduleUpdate(BaseModel):
    """Schema for updating availability."""
    timezone: Optional[str] = None
    weekly_hours: Optional[List[WeeklyHoursBase]] = None


class AvailabilityScheduleResponse(AvailabilityScheduleBase):
    """Response schema for availability schedule."""
    id: str
    user_id: str
    weekly_hours: List[WeeklyHoursResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScheduleListItem(BaseModel):
    """Simplified schedule for list view."""
    id: str
    name: str
    timezone: str
    is_default: bool


class ScheduleListResponse(BaseModel):
    """Response for listing schedules."""
    schedules: List[ScheduleListItem]


class ScheduleCreate(BaseModel):
    """Schema for creating a new schedule."""
    name: str = Field(default="Working Hours", max_length=100)
    timezone: str = Field(default="UTC", max_length=50)
    is_default: bool = False


class DateOverrideCreate(BaseModel):
    """Schema for creating a date override."""
    schedule_id: Optional[str] = None  # Uses default schedule if not provided
    specific_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD
    intervals: List[TimeInterval] = []  # Empty = unavailable


class DateOverrideResponse(BaseModel):
    """Response for date override."""
    id: str
    schedule_id: str
    specific_date: str
    intervals: List[TimeInterval]
    created_at: datetime

    class Config:
        from_attributes = True


class TimezoneUpdate(BaseModel):
    """Schema for updating timezone."""
    timezone: str = Field(..., max_length=50)


class MeetingNotesCreate(BaseModel):
    """Schema for creating/updating meeting notes."""
    content: str = Field(..., min_length=1)


class MeetingNotesResponse(BaseModel):
    """Response for meeting notes."""
    id: str
    booking_id: str
    content: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Booking Schemas ============
class InviteeInfo(BaseModel):
    """Invitee information for booking."""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class BookingCreate(BaseModel):
    """Schema for creating a booking."""
    event_type_id: str
    start_time: datetime
    timezone: str = Field(..., max_length=50)
    invitee: InviteeInfo
    guests: List[EmailStr] = []
    answers: dict = {}


class BookingResponse(BaseModel):
    """Schema for booking response."""
    id: str
    event_type_id: str
    host_id: str
    start_time: datetime
    end_time: datetime
    invitee_timezone: str
    invitee_name: str
    invitee_email: str
    guests: List[str]
    status: str
    cancelled_at: Optional[datetime] = None
    cancel_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    event_type: Optional[EventTypeResponse] = None

    class Config:
        from_attributes = True


class BookingListResponse(BaseModel):
    """Schema for listing bookings."""
    bookings: List[BookingResponse]
    total: int


class CancelBookingRequest(BaseModel):
    """Schema for cancelling a booking."""
    reason: Optional[str] = None


# ============ Slot Schemas ============
class TimeSlot(BaseModel):
    """Available time slot."""
    start_time: str
    end_time: str


class AvailableSlotsResponse(BaseModel):
    """Response for available slots."""
    date: str
    timezone: str
    slots: List[TimeSlot]


class AvailableDatesResponse(BaseModel):
    """Response for available dates in a month."""
    year: int
    month: int
    dates: List[str]  # List of available dates in YYYY-MM-DD format


# ============ Public Booking Page Schemas ============
class PublicEventTypeResponse(BaseModel):
    """Public event type info for booking page."""
    id: str
    name: str
    slug: str
    duration_minutes: int
    color: str
    description: Optional[str] = None
    location_type: Optional[str] = None

    class Config:
        from_attributes = True


class PublicHostResponse(BaseModel):
    """Public host info for booking page."""
    name: str
    username: str


class PublicBookingPageResponse(BaseModel):
    """Response for public booking page."""
    event_type: PublicEventTypeResponse
    host: PublicHostResponse
