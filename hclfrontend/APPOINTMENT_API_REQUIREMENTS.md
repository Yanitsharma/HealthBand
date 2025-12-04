# 🩺 Doctor Appointment API Requirements

## Overview
This document outlines the API endpoints required for the Doctor Appointment booking system.

---

## 📋 Required API Endpoints

### 1. Get List of Doctors

**GET** `/api/appointments/doctors` 🔒 Protected

Get all available doctors with their details and specialties.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters (Optional):**
- `specialty` - Filter by specialty (e.g., "Cardiologist", "General Physician")
- `search` - Search by doctor name or specialty
- `available` - Filter only doctors with available slots (boolean)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiologist",
      "experience": "15 years",
      "rating": 4.8,
      "totalReviews": 234,
      "image": "https://example.com/images/doctor1.jpg",
      "fees": 150,
      "currency": "USD",
      "qualifications": ["MBBS", "MD Cardiology", "FACC"],
      "languages": ["English", "Spanish"],
      "about": "Experienced cardiologist specializing in preventive cardiology..."
    }
  ]
}
```

---

### 2. Get Doctor Availability

**GET** `/api/appointments/doctors/:doctorId/availability` 🔒 Protected

Get available time slots for a specific doctor on a given date.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `date` (required) - Date in ISO format (e.g., "2024-12-10")

**Response:**
```json
{
  "success": true,
  "data": {
    "doctorId": "doc_123",
    "doctorName": "Dr. Sarah Johnson",
    "date": "2024-12-10",
    "availableSlots": [
      {
        "time": "09:00 AM",
        "slotId": "slot_001",
        "available": true
      },
      {
        "time": "10:30 AM",
        "slotId": "slot_002",
        "available": true
      },
      {
        "time": "02:00 PM",
        "slotId": "slot_003",
        "available": false
      }
    ]
  }
}
```

---

### 3. Book an Appointment

**POST** `/api/appointments/book` 🔒 Protected

Book a new appointment with a doctor.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "doctorId": "doc_123",
  "date": "2024-12-10",
  "time": "09:00 AM",
  "slotId": "slot_001",
  "reason": "Regular checkup and consultation for chest pain",
  "patientNotes": "Additional notes from patient (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointmentId": "appt_789",
    "patientId": "patient_456",
    "patientName": "John Doe",
    "doctorId": "doc_123",
    "doctorName": "Dr. Sarah Johnson",
    "specialty": "Cardiologist",
    "date": "2024-12-10",
    "time": "09:00 AM",
    "reason": "Regular checkup and consultation for chest pain",
    "status": "confirmed",
    "fees": 150,
    "currency": "USD",
    "bookingDate": "2024-12-04T10:30:00.000Z",
    "appointmentLocation": "Clinic Room 3, 2nd Floor",
    "instructions": "Please arrive 15 minutes early. Bring any previous medical records."
  }
}
```

---

### 4. Get Patient Appointments

**GET** `/api/appointments/my-appointments` 🔒 Protected

Get all appointments for the logged-in patient.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters (Optional):**
- `status` - Filter by status: "upcoming", "completed", "cancelled"
- `fromDate` - Start date filter
- `toDate` - End date filter

**Response:**
```json
{
  "success": true,
  "data": {
    "upcoming": [
      {
        "appointmentId": "appt_789",
        "doctorName": "Dr. Sarah Johnson",
        "doctorImage": "https://example.com/images/doctor1.jpg",
        "specialty": "Cardiologist",
        "date": "2024-12-10",
        "time": "09:00 AM",
        "reason": "Regular checkup",
        "status": "confirmed",
        "fees": 150,
        "currency": "USD",
        "location": "Clinic Room 3",
        "canCancel": true,
        "canReschedule": true
      }
    ],
    "past": [
      {
        "appointmentId": "appt_788",
        "doctorName": "Dr. Michael Chen",
        "specialty": "General Physician",
        "date": "2024-11-20",
        "time": "02:00 PM",
        "status": "completed",
        "fees": 100,
        "canReview": true
      }
    ]
  }
}
```

---

### 5. Cancel Appointment

**PUT** `/api/appointments/:appointmentId/cancel` 🔒 Protected

Cancel an existing appointment.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body (Optional):**
```json
{
  "cancellationReason": "Unable to make it due to emergency"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "appointmentId": "appt_789",
    "status": "cancelled",
    "refundAmount": 150,
    "refundStatus": "processing"
  }
}
```

---

### 6. Reschedule Appointment

**PUT** `/api/appointments/:appointmentId/reschedule` 🔒 Protected

Reschedule an existing appointment.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "newDate": "2024-12-11",
  "newTime": "10:30 AM",
  "newSlotId": "slot_005"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "data": {
    "appointmentId": "appt_789",
    "oldDate": "2024-12-10",
    "oldTime": "09:00 AM",
    "newDate": "2024-12-11",
    "newTime": "10:30 AM",
    "status": "confirmed"
  }
}
```

---

### 7. Get Appointment Details

**GET** `/api/appointments/:appointmentId` 🔒 Protected

Get detailed information about a specific appointment.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointmentId": "appt_789",
    "patient": {
      "id": "patient_456",
      "name": "John Doe",
      "age": 35,
      "gender": "Male",
      "phone": "+1234567890",
      "email": "john@example.com"
    },
    "doctor": {
      "id": "doc_123",
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiologist",
      "image": "https://example.com/images/doctor1.jpg",
      "phone": "+1987654321",
      "email": "dr.sarah@clinic.com"
    },
    "date": "2024-12-10",
    "time": "09:00 AM",
    "duration": "30 minutes",
    "reason": "Regular checkup and consultation",
    "status": "confirmed",
    "fees": 150,
    "currency": "USD",
    "paymentStatus": "paid",
    "location": "Clinic Room 3, 2nd Floor",
    "address": "123 Medical Center, Healthcare City",
    "instructions": "Please arrive 15 minutes early",
    "bookingDate": "2024-12-04T10:30:00.000Z"
  }
}
```

---

## 📊 Data Models

### Doctor Model
```typescript
{
  id: string;                    // Unique doctor ID
  name: string;                  // Full name
  specialty: string;             // Medical specialty
  experience: string;            // Years of experience
  rating: number;                // Average rating (0-5)
  totalReviews: number;          // Number of reviews
  image: string;                 // Profile image URL
  fees: number;                  // Consultation fee
  currency: string;              // Currency (USD, EUR, etc.)
  qualifications: string[];      // Array of qualifications
  languages: string[];           // Languages spoken
  about: string;                 // Doctor bio
}
```

### Appointment Model
```typescript
{
  appointmentId: string;         // Unique appointment ID
  patientId: string;             // Patient ID
  doctorId: string;              // Doctor ID
  date: string;                  // Appointment date (ISO format)
  time: string;                  // Appointment time (12-hour format)
  slotId: string;                // Time slot ID
  reason: string;                // Reason for visit
  status: string;                // confirmed | completed | cancelled | rescheduled
  fees: number;                  // Consultation fee
  currency: string;              // Currency
  bookingDate: string;           // When booking was made
  location: string;              // Appointment location
  instructions: string;          // Special instructions
}
```

---

## 🎯 Frontend Integration Points

### In DoctorAppointmentModal Component:

1. **Step 1: Doctor Selection**
   - Calls: `GET /api/appointments/doctors`
   - Filters and displays doctors
   - Search and specialty filter

2. **Step 2: Time Selection**
   - Calls: `GET /api/appointments/doctors/:doctorId/availability?date=YYYY-MM-DD`
   - Shows available time slots
   - Date picker for appointment date

3. **Step 3: Confirmation**
   - Calls: `POST /api/appointments/book`
   - Sends appointment data
   - Shows confirmation

### Additional Features to Add:

1. **My Appointments Page**
   - Calls: `GET /api/appointments/my-appointments`
   - Display upcoming and past appointments
   - Cancel/Reschedule buttons

2. **Appointment Details View**
   - Calls: `GET /api/appointments/:appointmentId`
   - Show full appointment details
   - Download appointment receipt

---

## 🔄 Error Handling

### Common Error Responses:

```json
{
  "success": false,
  "message": "Error message here",
  "error": {
    "code": "SLOT_NOT_AVAILABLE",
    "details": "This time slot has been booked by another patient"
  }
}
```

### Error Codes:
- `SLOT_NOT_AVAILABLE` - Time slot no longer available
- `DOCTOR_NOT_AVAILABLE` - Doctor not available on selected date
- `INVALID_DATE` - Date is in the past or invalid
- `APPOINTMENT_NOT_FOUND` - Appointment ID not found
- `CANNOT_CANCEL` - Appointment cannot be cancelled (too close to appointment time)
- `ALREADY_BOOKED` - Patient already has an appointment with this doctor on this date

---

## 🧪 Testing Workflow

1. **Get doctors list**
   ```
   GET /api/appointments/doctors
   ```

2. **Get availability for a doctor**
   ```
   GET /api/appointments/doctors/doc_123/availability?date=2024-12-10
   ```

3. **Book an appointment**
   ```
   POST /api/appointments/book
   Body: { doctorId, date, time, slotId, reason }
   ```

4. **View my appointments**
   ```
   GET /api/appointments/my-appointments
   ```

5. **Cancel an appointment**
   ```
   PUT /api/appointments/appt_789/cancel
   ```

---

## 💡 Optional Enhancements

### Nice-to-Have Features:

1. **Doctor Reviews**
   - `GET /api/appointments/doctors/:doctorId/reviews`
   - `POST /api/appointments/:appointmentId/review`

2. **Favorite Doctors**
   - `POST /api/appointments/doctors/:doctorId/favorite`
   - `GET /api/appointments/favorites`

3. **Appointment Reminders**
   - `GET /api/appointments/:appointmentId/reminders`
   - Email/SMS notifications

4. **Video Consultation**
   - `GET /api/appointments/:appointmentId/video-link`
   - For telemedicine appointments

5. **Medical Records**
   - `POST /api/appointments/:appointmentId/upload-records`
   - Upload reports before appointment

---

## 📝 Notes

- All dates should be in ISO 8601 format
- All protected routes require JWT token in Authorization header
- Appointment booking should validate:
  - Doctor availability
  - Time slot availability
  - No duplicate bookings
  - Minimum notice period (e.g., can't book within 1 hour)
- Consider implementing appointment notifications (email/SMS)
- Implement cancellation policy (e.g., free cancellation up to 24 hours before)

---

## 🚀 Implementation Priority

**Phase 1 (MVP):**
1. ✅ Get doctors list
2. ✅ Get doctor availability
3. ✅ Book appointment
4. ✅ Get my appointments

**Phase 2:**
5. Cancel appointment
6. Appointment details

**Phase 3:**
7. Reschedule appointment
8. Reviews and ratings
9. Notifications

---

This completes the API requirements for the Doctor Appointment system! 🎉

