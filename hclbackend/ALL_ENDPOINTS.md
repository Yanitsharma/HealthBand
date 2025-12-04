# 🎯 HealthBand API - Complete Endpoints List

## Base URL: `http://localhost:5000`

---

## 🔓 **Public Endpoints** (No Authentication Required)

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

---

## 🔒 **Protected Endpoints** (Require JWT Token)

### Authentication & Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user profile |

---

### Patient Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient/dashboard` | Get complete dashboard data |
| PUT | `/api/patient/goals` | Update daily health goals |
| PUT | `/api/patient/activity` | Update today's activity progress |
| POST | `/api/patient/reset-daily` | Reset daily activity to 0 |

---

### Health Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patient/reminders` | Add new health reminder |
| GET | `/api/patient/reminders` | Get all reminders |
| PUT | `/api/patient/reminders/:id` | Update a reminder |
| DELETE | `/api/patient/reminders/:id` | Delete a reminder |

---

### Doctor Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/doctors` | Get list of all doctors |
| GET | `/api/appointments/doctors/:doctorId/availability` | Get doctor's available time slots |
| POST | `/api/appointments/book` | Book a new appointment |
| GET | `/api/appointments/my-appointments` | Get patient's appointments |
| GET | `/api/appointments/:appointmentId` | Get appointment details |
| PUT | `/api/appointments/:appointmentId/cancel` | Cancel an appointment |
| PUT | `/api/appointments/:appointmentId/reschedule` | Reschedule an appointment |

---

### Users (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create new user |

---

## 📊 **Quick Reference by Feature**

### 🔐 Authentication (2 endpoints)
- Register
- Login
- Get Profile

### 🏥 Patient Health (9 endpoints)
- Dashboard
- Goals Management
- Activity Tracking
- Health Reminders (CRUD)

### 🩺 Doctor Appointments (7 endpoints)
- Browse Doctors
- Check Availability
- Book Appointment
- View Appointments
- Appointment Details
- Cancel Appointment
- Reschedule Appointment

### 👥 User Management (2 endpoints)
- Get Users
- Create User

---

## 🎯 **Total Endpoints: 20**

- ✅ 2 Public endpoints
- ✅ 18 Protected endpoints
- ✅ All fully functional and tested

---

## 📝 **Authentication Header Format**

For all protected endpoints:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 🚀 **Server Commands**

```bash
# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Seed doctors database
npm run seed:doctors
```

---

## 📚 **Documentation Files**

1. **API_DOCUMENTATION.md** - Patient Dashboard API docs
2. **APPOINTMENT_API_DOCUMENTATION.md** - Doctor Appointment API docs
3. **QUICK_START_GUIDE.md** - Getting started guide
4. **ALL_ENDPOINTS.md** - This file (complete endpoints list)

---

## 🎊 **API Status: COMPLETE**

All required endpoints have been implemented, tested, and documented!

Server is running on: **http://localhost:5000** 🚀

