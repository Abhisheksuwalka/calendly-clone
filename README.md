# Calendly Clone

A full-stack scheduling and booking application that replicates core Calendly functionality. Built with React for the frontend and FastAPI with Prisma ORM for the backend.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Overview

This application enables users to create customizable event types, define their availability schedules, and share booking links with invitees. The system handles time zone conversions, buffer times, and scheduling conflicts automatically.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 7 | Build Tool |
| React Router DOM | Client-side Routing |
| TanStack React Query | Server State Management |
| Tailwind CSS 4 | Utility-first Styling |
| Radix UI | Accessible UI Primitives |
| Lucide React | Icon Library |
| React Hook Form + Zod | Form Handling & Validation |
| date-fns | Date Manipulation |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | Web Framework |
| Prisma ORM | Database ORM |
| PostgreSQL | Relational Database |
| Pydantic | Data Validation |
| Uvicorn | ASGI Server |

---

## Features

### Event Type Management
- Create, edit, and delete event types
- Configure duration (15, 30, 60 minutes, etc.)
- Set custom colors for visual distinction
- Define buffer times before and after meetings
- Set minimum notice period and maximum days ahead for booking
- Toggle event types as active/inactive
- Duplicate existing event types

### Availability Scheduling
- Define weekly recurring availability hours
- Set different time slots for each day of the week
- Create date-specific overrides (block specific dates or set custom hours)
- Multiple timezone support
- Create and manage multiple availability schedules

### Booking System
- Public booking page with shareable URL format: `/book/{username}/{event-slug}`
- Calendar view showing available dates
- Time slot selection respecting host availability
- Invitee information collection (name, email, guests)
- Booking confirmation with meeting details
- Automatic conflict detection

### Scheduled Events Dashboard
- View upcoming and past meetings
- Filter meetings by status
- Cancel meetings with reason tracking
- Add and manage meeting notes
- Reschedule functionality

### Additional Features
- Responsive design for mobile and desktop
- Real-time form validation
- Toast notifications for user feedback
- Paginated API responses

---

## Project Structure

```
calendly-clone/
├── backend/
│   ├── api/                    # Vercel serverless entry point
│   │   └── index.py
│   ├── prisma/
│   │   └── schema.prisma       # Database schema definition
│   ├── src/
│   │   ├── api/                # API route handlers
│   │   │   ├── availability.py
│   │   │   ├── bookings.py
│   │   │   ├── event_types.py
│   │   │   └── users.py
│   │   ├── core/               # Configuration and database
│   │   ├── schemas/            # Pydantic models
│   │   ├── services/           # Business logic
│   │   └── main.py             # FastAPI application
│   ├── requirements.txt
│   └── vercel.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   │   ├── Availability.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventTypes.jsx
│   │   │   ├── ScheduledEvents.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── ...
│   │   ├── lib/                # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database credentials:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/calendly_db
   CORS_ORIGINS=http://localhost:5173
   HOST=0.0.0.0
   PORT=8000
   ```

5. Set up the database:
   ```bash
   prisma generate
   prisma db push
   ```

6. Start the development server:
   ```bash
   python -m src.main
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   echo "VITE_API_URL=http://localhost:8000" > .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

---

## API Documentation

The backend provides interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### API Endpoints

#### Event Types (`/api/v1/event-types`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all event types |
| POST | `/` | Create new event type |
| GET | `/{id}` | Get event type by ID |
| PUT | `/{id}` | Update event type |
| DELETE | `/{id}` | Delete event type |
| POST | `/{id}/toggle` | Toggle active status |
| POST | `/{id}/duplicate` | Duplicate event type |

#### Availability (`/api/v1/availability`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schedule` | Get availability schedule |
| PUT | `/schedule` | Update availability schedule |
| GET | `/schedules` | List all schedules |
| POST | `/schedules` | Create new schedule |
| POST | `/date-overrides` | Add date override |
| DELETE | `/date-overrides/{id}` | Remove date override |
| PUT | `/timezone` | Update timezone |

#### Bookings (`/api/v1`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/available-dates` | Get available dates for month |
| GET | `/public/available-slots` | Get time slots for date |
| GET | `/public/{username}/{slug}` | Get public event info |
| POST | `/bookings` | Create new booking |
| GET | `/bookings/{id}` | Get booking confirmation |
| GET | `/meetings` | List user's meetings |
| GET | `/meetings/{id}` | Get meeting details |
| POST | `/meetings/{id}/cancel` | Cancel meeting |
| PUT | `/meetings/{id}/notes` | Add/update meeting notes |
| DELETE | `/meetings/{id}/notes` | Delete meeting notes |

#### Users (`/api/v1/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user profile |

---

## Database Schema

The application uses the following data models:

| Model | Description |
|-------|-------------|
| `User` | Host/user account information |
| `EventType` | Meeting type configurations |
| `AvailabilitySchedule` | Weekly availability definitions |
| `WeeklyHours` | Day-specific time intervals |
| `DateOverride` | Date-specific availability exceptions |
| `Booking` | Scheduled meeting records |
| `MeetingNotes` | Host notes for bookings |

---

## Deployment

### Backend (Vercel)

The backend is configured for Vercel deployment:

1. Push the repository to GitHub
2. Import the project in Vercel
3. Set the root directory to `backend`
4. Configure environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `CORS_ORIGINS`: Frontend URL(s)

### Frontend (Vercel)

1. Import the project in Vercel
2. Set the root directory to `frontend`
3. Configure environment variables:
   - `VITE_API_URL`: Backend API URL

---

## Author

**Abhishek Suwalka**

- Email: suwalkabhishek@gmail.com
- LinkedIn: [linkedin.com/in/abhisheksuwalka](https://linkedin.com/in/abhisheksuwalka)
