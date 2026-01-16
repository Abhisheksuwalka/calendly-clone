# Calendly Clone - Backend

A FastAPI backend for the Calendly clone application, providing scheduling and calendar management APIs.

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast Python web framework
- **Python**: 3.11+
- **Database**: PostgreSQL (Neon Cloud)
- **ORM**: Prisma Client Python
- **Validation**: Pydantic v2

## Project Structure

```
backend/
├── src/
│   ├── api/           # API route handlers
│   │   ├── event_types.py   # Event Types CRUD (7 endpoints)
│   │   ├── availability.py  # Availability management (7 endpoints)
│   │   ├── bookings.py      # Public booking + Meetings (11 endpoints)
│   │   └── users.py         # User endpoint (1 endpoint)
│   ├── core/          # Core configuration
│   │   ├── config.py        # Pydantic settings
│   │   ├── database.py      # Prisma client lifecycle
│   │   └── responses.py     # Response helpers
│   ├── prisma/        # Prisma schema
│   │   └── schema.prisma    # Database models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/      # Business logic (planned)
│   └── main.py        # Application entry point
├── scripts/           # Utility scripts
│   └── seed.py        # Database seeding
├── tests/             # Test files
├── requirements.txt   # Python dependencies
├── .env               # Environment variables (not in git)
├── .env.example       # Environment variables template
└── README.md
```

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- PostgreSQL database (or Neon cloud account)

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements-production.txt

# 4. Setup environment
cp .env.example .env
# Edit .env and add your DATABASE_URL

# 5. Setup Prisma (CRITICAL - Don't skip!)
prisma generate    # Generates the Prisma client
prisma db push     # Creates database tables

# 6. Seed database (optional but recommended)
python -m scripts.seed

# 7. Run the server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Server will be running at:** http://localhost:8000

---

## Detailed Setup Guide

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment (use .venv as folder name)
python3 -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.\.venv\Scripts\activate
```

> **Note:** Your terminal prompt should now show `(.venv)` prefix, indicating the virtual environment is active.

### 3. Install Dependencies

```bash
# For production (recommended)
pip install -r requirements-production.txt

# OR for development
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Configure the following environment variables in `.env`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Example for Neon:
# DATABASE_URL=postgresql://neondb_owner:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

### 5. Database Setup (Prisma) ⚠️ CRITICAL STEP

> **⚠️ IMPORTANT:** You MUST run `prisma generate` before starting the server. This generates the Python Prisma client from your schema. Skipping this step will cause a `RuntimeError: The Client hasn't been generated yet` error.

```bash
# Step 1: Generate Prisma client (REQUIRED)
prisma generate

# Step 2: Push schema to database (creates tables)
prisma db push

# Step 3: Seed the database with sample data (optional but recommended)
python -m scripts.seed
```

### 6. Run the Server

```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# OR using Python directly
python -m src.main
```

The API will be available at:
- **API Base URL**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints (25 Total)

### User (1)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/me` | Get current user |

### Event Types (7)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/event-types` | List all event types |
| GET | `/api/v1/event-types/{id}` | Get event type by ID |
| POST | `/api/v1/event-types` | Create event type |
| PUT | `/api/v1/event-types/{id}` | Update event type |
| DELETE | `/api/v1/event-types/{id}` | Delete event type |
| PATCH | `/api/v1/event-types/{id}/toggle` | Toggle active status |
| POST | `/api/v1/event-types/{id}/duplicate` | Duplicate event type |

### Availability (7)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/availability/schedule` | Get default schedule |
| PUT | `/api/v1/availability/schedule` | Update schedule |
| GET | `/api/v1/availability/schedules` | List all schedules |
| POST | `/api/v1/availability/schedules` | Create new schedule |
| POST | `/api/v1/availability/date-overrides` | Add date override |
| DELETE | `/api/v1/availability/date-overrides/{id}` | Delete date override |
| PATCH | `/api/v1/availability/schedule/timezone` | Update timezone |

### Public Booking (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/public/{username}/{slug}` | Get event type info |
| GET | `/api/v1/public/available-dates` | Get available dates |
| GET | `/api/v1/public/slots` | Get time slots |
| POST | `/api/v1/public/bookings` | Create booking |
| GET | `/api/v1/public/bookings/{id}` | Get booking confirmation |

### Meetings (5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings` | List meetings |
| GET | `/api/v1/meetings/{id}` | Get meeting details |
| POST | `/api/v1/meetings/{id}/cancel` | Cancel meeting |
| PUT | `/api/v1/meetings/{id}/notes` | Add/update notes |
| DELETE | `/api/v1/meetings/{id}/notes` | Delete notes |

## Seed Data

The seed script creates:
- Default user (abhishek, abhishek.s22@iiits.in)
- 3 event types (30 min, 15 min, 1 hour)
- Default availability schedule (Mon-Fri, 9am-5pm)
- Sample bookings (upcoming and past)

Run seed:
```bash
python -m scripts.seed
```

## Common Commands

| Command | Description |
|---------|-------------|
| `uvicorn src.main:app --reload` | Start dev server with hot reload |
| `prisma generate` | Generate Prisma client |
| `prisma db push` | Push schema to database |
| `prisma studio` | Open Prisma database GUI |
| `python -m scripts.seed` | Seed database with sample data |

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

1. Ensure DATABASE_URL is correctly set in `.env`
2. Check if Neon project is active
3. Verify SSL mode is enabled (`?sslmode=require`)

### Prisma Client Not Found

```bash
# Regenerate Prisma client
prisma generate
```

### Module Not Found Errors

Ensure virtual environment is activated and dependencies are installed:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

## Authentication (MVP)

For the MVP, no authentication is required. A default user is assumed to be logged in:
- **User ID**: `default-user-001`
- **Username**: `abhishek`
- **Timezone**: `Asia/Kolkata`

The default user is auto-created on first API call if it doesn't exist.

## License

This project is for educational purposes (Scaler SDE Intern Assignment).
