#!/usr/bin/env python3
"""
Database Seed Script for Calendly Clone
Creates sample data for testing and evaluation.

Usage:
    cd backend
    source venv/bin/activate
    python -m scripts.seed
"""
import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from prisma import Prisma
from prisma import Json

# Default User Configuration
DEFAULT_USER = {
    "id": "default-user-001",
    "username": "abhishek",
    "name": "Abhishek Suwalka",
    "email": "abhishek.s22@iiits.in",
    "timezone": "Asia/Kolkata"
}

# Sample Event Types
EVENT_TYPES = [
    {
        "name": "30 Minute Meeting",
        "slug": "30-minute-meeting",
        "durationMinutes": 30,
        "color": "#8B5CF6",  # Purple
        "description": "A quick 30-minute chat to discuss anything",
        "locationType": "ZOOM",
        "bufferBeforeMinutes": 0,
        "bufferAfterMinutes": 0,
        "minNoticeHours": 4,
        "maxDaysAhead": 60,
        "isActive": True
    },
    {
        "name": "15 Minute Coffee Chat",
        "slug": "15-minute-coffee-chat",
        "durationMinutes": 15,
        "color": "#3B82F6",  # Blue
        "description": "Quick intro call or brief discussion",
        "locationType": "PHONE",
        "bufferBeforeMinutes": 0,
        "bufferAfterMinutes": 5,
        "minNoticeHours": 2,
        "maxDaysAhead": 30,
        "isActive": True
    },
    {
        "name": "1 Hour Consultation",
        "slug": "1-hour-consultation",
        "durationMinutes": 60,
        "color": "#10B981",  # Green
        "description": "In-depth consultation for complex topics",
        "locationType": "ZOOM",
        "bufferBeforeMinutes": 5,
        "bufferAfterMinutes": 10,
        "minNoticeHours": 24,
        "maxDaysAhead": 90,
        "isActive": True
    }
]

# Default Weekly Hours (Mon-Fri 9am-5pm)
WEEKLY_HOURS = [
    {"dayOfWeek": 0, "isEnabled": False, "intervals": []},  # Sunday
    {"dayOfWeek": 1, "isEnabled": True, "intervals": [{"start_time": "09:00", "end_time": "17:00"}]},  # Monday
    {"dayOfWeek": 2, "isEnabled": True, "intervals": [{"start_time": "09:00", "end_time": "17:00"}]},  # Tuesday
    {"dayOfWeek": 3, "isEnabled": True, "intervals": [{"start_time": "09:00", "end_time": "17:00"}]},  # Wednesday
    {"dayOfWeek": 4, "isEnabled": True, "intervals": [{"start_time": "09:00", "end_time": "17:00"}]},  # Thursday
    {"dayOfWeek": 5, "isEnabled": True, "intervals": [{"start_time": "09:00", "end_time": "17:00"}]},  # Friday
    {"dayOfWeek": 6, "isEnabled": False, "intervals": []}   # Saturday
]


async def seed_database():
    """Main seeding function."""
    db = Prisma()
    await db.connect()
    
    print("🌱 Starting database seed...")
    
    try:
        # 1. Create or get default user
        print("\n📌 Setting up default user...")
        user = await db.user.find_unique(where={"id": DEFAULT_USER["id"]})
        if not user:
            user = await db.user.create(data=DEFAULT_USER)
            print(f"   ✅ Created user: {user.username}")
        else:
            print(f"   ℹ️  User already exists: {user.username}")
        
        # 2. Create default availability schedule
        print("\n📅 Setting up availability schedule...")
        schedule = await db.availabilityschedule.find_first(
            where={"userId": user.id, "isDefault": True}
        )
        if not schedule:
            schedule = await db.availabilityschedule.create(
                data={
                    "userId": user.id,
                    "name": "Working Hours",
                    "timezone": "Asia/Kolkata",
                    "isDefault": True
                }
            )
            print(f"   ✅ Created schedule: {schedule.name}")
            
            # Create weekly hours
            for wh in WEEKLY_HOURS:
                await db.weeklyhours.create(
                    data={
                        "scheduleId": schedule.id,
                        "dayOfWeek": wh["dayOfWeek"],
                        "isEnabled": wh["isEnabled"],
                        "intervals": Json(wh["intervals"])
                    }
                )
            print("   ✅ Created weekly hours (Mon-Fri, 9am-5pm)")
        else:
            print(f"   ℹ️  Schedule already exists: {schedule.name}")
        
        # 3. Create event types
        print("\n📋 Setting up event types...")
        created_event_types = []
        for et_data in EVENT_TYPES:
            existing = await db.eventtype.find_first(
                where={"userId": user.id, "slug": et_data["slug"]}
            )
            if not existing:
                event_type = await db.eventtype.create(
                    data={**et_data, "userId": user.id}
                )
                created_event_types.append(event_type)
                print(f"   ✅ Created: {event_type.name} ({event_type.durationMinutes} min)")
            else:
                created_event_types.append(existing)
                print(f"   ℹ️  Already exists: {existing.name}")
        
        # 4. Create sample bookings
        print("\n📆 Setting up sample bookings...")
        
        # Get the 30-minute meeting event type
        event_type_30 = next((et for et in created_event_types if et.durationMinutes == 30), None)
        event_type_15 = next((et for et in created_event_types if et.durationMinutes == 15), None)
        
        if event_type_30:
            # Calculate future dates (next Monday at 10am UTC)
            today = datetime.utcnow()
            days_until_monday = (7 - today.weekday()) % 7
            if days_until_monday == 0:
                days_until_monday = 7  # Get next Monday, not today
            next_monday = today + timedelta(days=days_until_monday)
            
            # Booking 1: Upcoming confirmed
            booking1_start = next_monday.replace(hour=10, minute=0, second=0, microsecond=0)
            existing_b1 = await db.booking.find_first(
                where={"hostId": user.id, "startTime": booking1_start}
            )
            if not existing_b1:
                await db.booking.create(
                    data={
                        "eventTypeId": event_type_30.id,
                        "hostId": user.id,
                        "startTime": booking1_start,
                        "endTime": booking1_start + timedelta(minutes=30),
                        "inviteeTimezone": "Asia/Kolkata",
                        "inviteeName": "John Doe",
                        "inviteeEmail": "john.doe@example.com",
                        "guests": Json([]),
                        "status": "CONFIRMED"
                    }
                )
                print(f"   ✅ Created booking: John Doe @ {booking1_start.strftime('%Y-%m-%d %H:%M')} UTC")
            
            # Booking 2: Another upcoming
            booking2_start = next_monday.replace(hour=14, minute=0, second=0, microsecond=0)
            existing_b2 = await db.booking.find_first(
                where={"hostId": user.id, "startTime": booking2_start}
            )
            if not existing_b2:
                await db.booking.create(
                    data={
                        "eventTypeId": event_type_30.id,
                        "hostId": user.id,
                        "startTime": booking2_start,
                        "endTime": booking2_start + timedelta(minutes=30),
                        "inviteeTimezone": "America/New_York",
                        "inviteeName": "Jane Smith",
                        "inviteeEmail": "jane.smith@example.com",
                        "guests": Json(["guest1@example.com"]),
                        "status": "CONFIRMED"
                    }
                )
                print(f"   ✅ Created booking: Jane Smith @ {booking2_start.strftime('%Y-%m-%d %H:%M')} UTC")
        
        if event_type_15:
            # Booking 3: Past booking (yesterday)
            yesterday = today - timedelta(days=1)
            booking3_start = yesterday.replace(hour=11, minute=0, second=0, microsecond=0)
            existing_b3 = await db.booking.find_first(
                where={"hostId": user.id, "inviteeEmail": "past.meeting@example.com"}
            )
            if not existing_b3:
                await db.booking.create(
                    data={
                        "eventTypeId": event_type_15.id,
                        "hostId": user.id,
                        "startTime": booking3_start,
                        "endTime": booking3_start + timedelta(minutes=15),
                        "inviteeTimezone": "Europe/London",
                        "inviteeName": "Past Meeting User",
                        "inviteeEmail": "past.meeting@example.com",
                        "guests": Json([]),
                        "status": "CONFIRMED"
                    }
                )
                print(f"   ✅ Created past booking: Past Meeting User")
        
        # 5. Create a sample date override (mark a date as unavailable)
        print("\n🚫 Setting up sample date override...")
        # Override for next Friday (unavailable)
        days_until_friday = (4 - today.weekday()) % 7
        if days_until_friday == 0:
            days_until_friday = 7
        next_friday = today + timedelta(days=days_until_friday)
        next_friday_date = next_friday.replace(hour=0, minute=0, second=0, microsecond=0)
        
        existing_override = await db.dateoverride.find_first(
            where={"scheduleId": schedule.id, "specificDate": next_friday_date}
        )
        if not existing_override:
            await db.dateoverride.create(
                data={
                    "scheduleId": schedule.id,
                    "specificDate": next_friday_date,
                    "intervals": Json([])  # Empty = unavailable
                }
            )
            print(f"   ✅ Created override: {next_friday_date.strftime('%Y-%m-%d')} (Unavailable)")
        else:
            print(f"   ℹ️  Override already exists for {next_friday_date.strftime('%Y-%m-%d')}")
        
        # Summary
        print("\n" + "="*50)
        print("🎉 Database seeding completed successfully!")
        print("="*50)
        print(f"""
Summary:
  • User: {user.username} ({user.email})
  • Schedule: {schedule.name} ({schedule.timezone})
  • Event Types: {len(created_event_types)}
  • Sample Bookings: Created (upcoming + past)
  • Date Override: {next_friday_date.strftime('%Y-%m-%d')}

Test URLs:
  • API Docs: http://localhost:8000/docs
  • Event Types: http://localhost:8000/api/v1/event-types
  • Public Booking: http://localhost:8000/api/v1/public/abhishek/30-minute-meeting
        """)
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    print("="*50)
    print("🗄️  Calendly Clone - Database Seed Script")
    print("="*50)
    asyncio.run(seed_database())
