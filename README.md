# 🏨 HotelPro — Full-Stack Hotel Management System (MERN)

HotelPro is a scalable, secure, and modern hotel management platform built with the MERN stack (MongoDB, Express.js, React, Node.js). Designed for boutique hotels, luxury resorts, and hospitality chains, it automates room inventory, reservations, front-desk workflows, guest profiles, billing/invoicing, and administrative intelligence.

---

## 🌟 Key Features & PRD Compliance

| Epic | Features Covered |
|---|---|
| **Epic 1: Auth & RBAC** | JWT stateless auth, bcrypt password hashing, profile management, password updates, admin user management |
| **Epic 2: Room & Inventory** | Room & Room Type CRUD, pricing overrides, amenities, visual live status (`Available`, `Occupied`, `Cleaning`, `Maintenance`), real-time availability search with zero double-booking guarantee |
| **Epic 3: Bookings & Reservations** | Conflict check condition (`existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn`), human-readable booking refs (`HP-YYYYMMDD-XXXX`), cancel policies with automated refund calculation |
| **Epic 4: Guest Check-in/Check-out** | Front-desk arrivals/departures, room state synchronization, incidentals & extra charges posting, automatic housekeeping cleaning dispatch |
| **Epic 5: Payments & Invoicing** | Multi-method payments (Card, Cash, UPI, Online), itemized PDF-printable invoices with exact tax breakdown |
| **Epic 6: Executive Analytics** | Occupancy %, revenue velocities (ADR, RevPAR), 14-day trends Chart.js visualizations, housekeeping task queues, and **CSV export** |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Bootstrap 5, Bootstrap Icons, Chart.js & React-Chartjs-2, Axios
- **Backend:** Node.js, Express.js, Mongoose ODM, JWT, bcryptjs, Helmet, Morgan, Express-Validator, Express-Rate-Limit
- **Database:** MongoDB (Local install, Atlas, or In-Memory fallback for testing)
- **Testing:** Jest + Supertest (Integration tests for double-booking conflict, auth, check-in/out, and invoicing)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ and **npm** v8+
- **MongoDB** (Local `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Installation
Install dependencies for both server and client:

```bash
# In the hotelpro root directory:
npm run install:all
```
*(Or navigate into `server` and `client` individually and run `npm install`)*

### 3. Environment Variables

Create environment configuration files from the sanitized templates:

```bash
# Server environment
copy server\.env.example server\.env   # Windows
# cp server/.env.example server/.env   # Linux/macOS

# Client environment
copy client\.env.example client\.env   # Windows
# cp client/.env.example client/.env   # Linux/macOS
```

#### Required Server Configuration (`server/.env`):
- `PORT`: REST API port (default: `5000`)
- `NODE_ENV`: Runtime environment (`development` or `production`)
- `MONGO_URI`: MongoDB connection string (e.g., MongoDB Atlas URI or local MongoDB)
- `USE_MEMORY_DB`: Set to `true` to run with embedded in-memory MongoDB (no local MongoDB installation required)
- `JWT_SECRET`: High-entropy cryptographic string used for signing authentication tokens
- `JWT_EXPIRES_IN`: Token validity span (default: `1d`)
- `CLIENT_URL`: Client web application origin for CORS (default: `http://localhost:5173`)
- `TAX_PERCENT`: Percentage tax applied to billing and itemized invoices (default: `12`)

#### Client Configuration (`client/.env`):
- `VITE_API_URL`: Backend API base URL (default: `http://localhost:5000/api/v1`)

### 4. Database Seeding

Populate the database with luxury suites, active rooms, sample bookings, tasks, and users:

```bash
npm run seed
```

---

## 🔑 Pre-Seeded Demo Credentials

All test accounts are pre-configured with quick one-click buttons on the Login page:

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Hotel General Manager (Admin)** | `admin@hotelpro.com` | `Admin@123` | Full Admin Console, Analytics, Room CRUD, Staff Management, CSV Export |
| **Front Desk Lead (Staff)** | `receptionist@hotelpro.com` | `Staff@123` | Front Desk Command, Check-in/Check-out, Room Grid, Walk-In Reservations |
| **Housekeeping Supervisor (Staff)** | `housekeeping@hotelpro.com` | `Staff@123` | Housekeeping Task Dispatch, Room Status Updates |
| **Operations Manager (Staff)** | `manager@hotelpro.com` | `Manager@123` | Front Desk, Maintenance Dispatch |
| **Guest User** | `guest@example.com` | `Guest@123` | Room Booking, Reservation History, Digital Invoices |

---

## 🏃 Running the Application

### Start the REST API Backend
```bash
cd server
npm run dev
# Starts on http://localhost:5000 (API at http://localhost:5000/api/v1)
```

### Start the React Frontend
```bash
cd client
npm run dev
# Starts on http://localhost:5173
```

---

## 🧪 Automated Testing

Execute the comprehensive test suite verifying critical PRD requirements:
- Duplicate registration rejection (409)
- Authentication authorization & RBAC enforcement (401/403)
- Check-out before check-in validation (400)
- **Zero double-booking race condition / overlapping reservation conflict rejection (409)**
- Check-in workflow (transitions room to `Occupied`)
- Check-out workflow (transitions room to `Cleaning`)
- Itemized invoice calculations and taxes

```bash
cd server
npm test
```

---

## 📡 REST API Reference

**Base URL:** `/api/v1`

### Authentication & Users
- `POST /api/v1/auth/register` — Register a guest
- `POST /api/v1/auth/login` — Sign in & obtain JWT
- `GET /api/v1/auth/me` — Current user profile
- `PUT /api/v1/auth/profile` — Update name/phone/address
- `PUT /api/v1/auth/change-password` — Change password
- `GET /api/v1/users` — [Admin] List users
- `POST /api/v1/users/staff` — [Admin] Create staff account

### Rooms & Inventory
- `GET /api/v1/rooms` — Catalog of all rooms
- `GET /api/v1/rooms/available?checkIn=&checkOut=&guests=&type=` — Conflict-free available rooms
- `GET /api/v1/rooms/:id` — Single room details
- `POST /api/v1/rooms` — [Admin] Create room
- `PATCH /api/v1/rooms/:id/status` — [Staff/Admin] Update status (`Available`, `Occupied`, `Cleaning`, `Maintenance`)

### Bookings & Check-in/Check-out
- `POST /api/v1/bookings` — Create reservation (with conflict prevention)
- `GET /api/v1/bookings/my` — Current guest's reservations
- `GET /api/v1/bookings` — [Staff/Admin] All reservations with filters
- `PATCH /api/v1/bookings/:id/check-in` — Check-in guest (sets room to `Occupied`)
- `PATCH /api/v1/bookings/:id/check-out` — Check-out guest (sets room to `Cleaning` & issues task)
- `PATCH /api/v1/bookings/:id/cancel` — Cancel booking with automated refund calculation
- `POST /api/v1/bookings/:id/charges` — Post incidentals/extra charges

### Payments & Invoices
- `POST /api/v1/payments` — Record payment
- `GET /api/v1/invoices/booking/:bookingId` — Get itemized invoice

### Dashboard, Reports & Tasks
- `GET /api/v1/dashboard/summary` — Front desk / GM summary KPIs
- `GET /api/v1/reports/revenue` — Revenue metrics, ADR, and RevPAR
- `GET /api/v1/reports/bookings?format=csv` — Export bookings directly to CSV
- `GET /api/v1/tasks` — Housekeeping & facility tasks list
- `PATCH /api/v1/tasks/:id/status` — Update task status (marking `Done` frees cleaning room to `Available`)

---

*HotelPro — Engineered strictly in alignment with Product Requirements Document (PRD) v1.0*
