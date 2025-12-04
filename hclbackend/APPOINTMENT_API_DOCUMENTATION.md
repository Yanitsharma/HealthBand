# 🩺 Doctor Appointment API - Complete Documentation

## 🎉 **API Successfully Created!**

All 7 endpoints from your requirements have been implemented and are ready to use!

---

## 📍 Base URL
```
http://localhost:5000/api/appointments
```

---

## 🔐 Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 **Implemented Endpoints**

### ✅ **Phase 1 (MVP) - COMPLETED**

#### 1. Get List of Doctors
**GET** `/api/appointments/doctors` 🔒 Protected

Get all available doctors with filtering options.

**Query Parameters (Optional):**
- `specialty` - Filter by specialty (e.g., "Cardiologist", "General Physician")
- `search` - Search by doctor name or specialty
- `available` - Filter only available doctors (`true`/`false`)

**Example Request:**
```bash
GET /api/appointments/doctors?specialty=Cardiologist
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "6751234567890abcdef12345",
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiologist",
      "experience": "15 years",
      "rating": 4.8,
      "totalReviews": 234,
      "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
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

#### 2. Get Doctor Availability
**GET** `/api/appointments/doctors/:doctorId/availability` 🔒 Protected

Get available time slots for a specific doctor on a given date.

**Query Parameters:**
- `date` (required) - Date in ISO format (e.g., "2024-12-10")

**Example Request:**
```bash
GET /api/appointments/doctors/6751234567890abcdef12345/availability?date=2024-12-10
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctorId": "6751234567890abcdef12345",
    "doctorName": "Dr. Sarah Johnson",
    "date": "2024-12-10",
    "availableSlots": [
      {
        "time": "09:00 AM",
        "slotId": "6751234567890abcdef12345_2024-12-10_0",
        "available": true
      },
      {
        "time": "09:30 AM",
        "slotId": "6751234567890abcdef12345_2024-12-10_1",
        "available": true
      },
      {
        "time": "10:00 AM",
        "slotId": "6751234567890abcdef12345_2024-12-10_2",
        "available": false
      }
    ]
  }
}
```

**Default Time Slots:**
- Morning: 09:00 AM - 11:30 AM (30-minute intervals)
- Afternoon: 02:00 PM - 05:00 PM (30-minute intervals)

---

#### 3. Book an Appointment
**POST** `/api/appointments/book` 🔒 Protected

Book a new appointment with a doctor.

**Request Body:**
```json
{
  "doctorId": "6751234567890abcdef12345",
  "date": "2024-12-10",
  "time": "09:00 AM",
  "slotId": "6751234567890abcdef12345_2024-12-10_0",
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
    "appointmentId": "6751234567890abcdef67890",
    "patientId": "6931971914772 1a1da629c4d",
    "patientName": "John Smith",
    "doctorId": "6751234567890abcdef12345",
    "doctorName": "Dr. Sarah Johnson",
    "specialty": "Cardiologist",
    "date": "2024-12-10T00:00:00.000Z",
    "time": "09:00 AM",
    "reason": "Regular checkup and consultation for chest pain",
    "status": "confirmed",
    "fees": 150,
    "currency": "USD",
    "bookingDate": "2024-12-04T15:30:00.000Z",
    "appointmentLocation": "Clinic Room 3, 2nd Floor",
    "instructions": "Please arrive 15 minutes early. Bring any previous medical records."
  }
}
```

**Validation:**
- All fields except `patientNotes` are required
- Date cannot be in the past
- Time slot must be available
- Cannot book duplicate appointment with same doctor on same date

---

#### 4. Get Patient Appointments
**GET** `/api/appointments/my-appointments` 🔒 Protected

Get all appointments for the logged-in patient.

**Query Parameters (Optional):**
- `status` - Filter by status: "upcoming", "completed", "cancelled"
- `fromDate` - Start date filter (ISO format)
- `toDate` - End date filter (ISO format)

**Example Request:**
```bash
GET /api/appointments/my-appointments?status=upcoming
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "upcoming": [
      {
        "appointmentId": "6751234567890abcdef67890",
        "doctorName": "Dr. Sarah Johnson",
        "doctorImage": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
        "specialty": "Cardiologist",
        "date": "2024-12-10T00:00:00.000Z",
        "time": "09:00 AM",
        "reason": "Regular checkup",
        "status": "confirmed",
        "fees": 150,
        "currency": "USD",
        "location": "Clinic Room 3, 2nd Floor",
        "canCancel": true,
        "canReschedule": true
      }
    ],
    "past": [
      {
        "appointmentId": "6751234567890abcdef67891",
        "doctorName": "Dr. Michael Chen",
        "doctorImage": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300",
        "specialty": "General Physician",
        "date": "2024-11-20T00:00:00.000Z",
        "time": "02:00 PM",
        "reason": "Annual checkup",
        "status": "completed",
        "fees": 100,
        "currency": "USD",
        "location": "Clinic Room 1, 2nd Floor",
        "canReview": true
      }
    ]
  }
}
```

---

### ✅ **Phase 2 - COMPLETED**

#### 5. Cancel Appointment
**PUT** `/api/appointments/:appointmentId/cancel` 🔒 Protected

Cancel an existing appointment.

**Request Body (Optional):**
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
    "appointmentId": "6751234567890abcdef67890",
    "status": "cancelled",
    "refundAmount": 150,
    "refundStatus": "processing"
  }
}
```

**Cancellation Rules:**
- Cannot cancel completed appointments
- Cannot cancel less than 1 hour before appointment time
- Cancellation frees up the time slot for other patients
- Full refund processed automatically

---

#### 6. Get Appointment Details
**GET** `/api/appointments/:appointmentId` 🔒 Protected

Get detailed information about a specific appointment.

**Example Request:**
```bash
GET /api/appointments/6751234567890abcdef67890
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointmentId": "6751234567890abcdef67890",
    "patient": {
      "id": "6931971914772 1a1da629c4d",
      "name": "John Smith",
      "username": "johnsmith",
      "email": "john@test.com"
    },
    "doctor": {
      "id": "6751234567890abcdef12345",
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiologist",
      "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
      "phone": "+1-555-0101",
      "email": "dr.sarah.johnson@healthband.com"
    },
    "date": "2024-12-10T00:00:00.000Z",
    "time": "09:00 AM",
    "duration": "30 minutes",
    "reason": "Regular checkup and consultation",
    "patientNotes": "Additional notes",
    "status": "confirmed",
    "fees": 150,
    "currency": "USD",
    "paymentStatus": "paid",
    "location": "Clinic Room 3, 2nd Floor",
    "address": "123 Medical Center, Healthcare City, HC 12345",
    "instructions": "Please arrive 15 minutes early. Bring any previous medical records.",
    "bookingDate": "2024-12-04T15:30:00.000Z"
  }
}
```

---

### ✅ **Phase 3 - COMPLETED**

#### 7. Reschedule Appointment
**PUT** `/api/appointments/:appointmentId/reschedule` 🔒 Protected

Reschedule an existing appointment to a new date/time.

**Request Body:**
```json
{
  "newDate": "2024-12-11",
  "newTime": "10:30 AM",
  "newSlotId": "6751234567890abcdef12345_2024-12-11_3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment rescheduled successfully",
  "data": {
    "appointmentId": "6751234567890abcdef67890",
    "oldDate": "2024-12-10T00:00:00.000Z",
    "oldTime": "09:00 AM",
    "newDate": "2024-12-11T00:00:00.000Z",
    "newTime": "10:30 AM",
    "status": "rescheduled"
  }
}
```

**Rescheduling Rules:**
- Cannot reschedule cancelled or completed appointments
- New time slot must be available
- Old time slot is automatically freed up
- Appointment history is maintained

---

## 🗄️ Database Models

### Doctor Model
```javascript
{
  name: String (required),
  specialty: String (required),
  experience: String (required),
  rating: Number (0-5),
  totalReviews: Number,
  image: String (URL),
  fees: Number (required),
  currency: String (default: "USD"),
  qualifications: [String],
  languages: [String],
  about: String,
  email: String (required, unique),
  phone: String (required),
  address: String,
  isAvailable: Boolean (default: true),
  createdAt: Date
}
```

### Appointment Model
```javascript
{
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: Doctor),
  date: Date (required),
  time: String (required),
  slotId: String (required),
  reason: String (required),
  patientNotes: String,
  status: String (confirmed | completed | cancelled | rescheduled),
  fees: Number,
  currency: String,
  paymentStatus: String (pending | paid | refunded),
  location: String,
  duration: String (default: "30 minutes"),
  instructions: String,
  cancellationReason: String,
  refundAmount: Number,
  refundStatus: String (none | processing | completed),
  bookingDate: Date,
  previousAppointments: [{date, time, modifiedAt}],
  createdAt: Date,
  updatedAt: Date
}
```

### TimeSlot Model
```javascript
{
  doctorId: ObjectId (ref: Doctor),
  date: Date (required),
  time: String (required),
  slotId: String (required, unique),
  isBooked: Boolean (default: false),
  bookedBy: ObjectId (ref: User),
  appointmentId: ObjectId (ref: Appointment),
  createdAt: Date
}
```

---

## 🔄 Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  }
}
```

### Error Codes:
- `SLOT_NOT_AVAILABLE` - Time slot has been booked
- `DOCTOR_NOT_AVAILABLE` - Doctor not accepting appointments
- `INVALID_DATE` - Date is in the past or invalid
- `APPOINTMENT_NOT_FOUND` - Appointment doesn't exist
- `CANNOT_CANCEL` - Cannot cancel (too close or already completed)
- `ALREADY_BOOKED` - Duplicate appointment exists

---

## 🧪 Testing Workflow

### Step 1: Login/Register
```bash
POST /api/auth/login
{
  "email": "john@test.com",
  "password": "password123"
}
```
**Save the token!**

### Step 2: Get Doctors List
```bash
GET /api/appointments/doctors
Authorization: Bearer YOUR_TOKEN
```
**Copy a doctor ID from the response**

### Step 3: Check Doctor Availability
```bash
GET /api/appointments/doctors/DOCTOR_ID/availability?date=2024-12-10
Authorization: Bearer YOUR_TOKEN
```
**Copy an available slot ID**

### Step 4: Book Appointment
```bash
POST /api/appointments/book
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "doctorId": "DOCTOR_ID",
  "date": "2024-12-10",
  "time": "09:00 AM",
  "slotId": "SLOT_ID",
  "reason": "Regular checkup"
}
```
**Save the appointment ID**

### Step 5: View My Appointments
```bash
GET /api/appointments/my-appointments
Authorization: Bearer YOUR_TOKEN
```

### Step 6: Get Appointment Details
```bash
GET /api/appointments/APPOINTMENT_ID
Authorization: Bearer YOUR_TOKEN
```

### Step 7: Reschedule (Optional)
```bash
PUT /api/appointments/APPOINTMENT_ID/reschedule
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "newDate": "2024-12-11",
  "newTime": "10:30 AM",
  "newSlotId": "NEW_SLOT_ID"
}
```

### Step 8: Cancel (Optional)
```bash
PUT /api/appointments/APPOINTMENT_ID/cancel
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "cancellationReason": "Schedule conflict"
}
```

---

## 📊 Seeded Doctors

The database has been pre-populated with 10 doctors:

1. **Dr. Sarah Johnson** - Cardiologist (15 years) - $150
2. **Dr. Michael Chen** - General Physician (10 years) - $100
3. **Dr. Emily Rodriguez** - Pediatrician (12 years) - $120
4. **Dr. James Williams** - Orthopedic Surgeon (18 years) - $200
5. **Dr. Priya Patel** - Dermatologist (8 years) - $130
6. **Dr. Robert Taylor** - Neurologist (20 years) - $180
7. **Dr. Lisa Anderson** - Psychiatrist (14 years) - $140
8. **Dr. David Kim** - Ophthalmologist (11 years) - $160
9. **Dr. Amanda Martinez** - Endocrinologist (9 years) - $145
10. **Dr. Thomas Brown** - Gastroenterologist (16 years) - $170

To re-seed doctors:
```bash
npm run seed:doctors
```

---

## 🎨 Frontend Integration

### Example: Booking Flow

```javascript
// 1. Fetch doctors
const doctorsResponse = await fetch('http://localhost:5000/api/appointments/doctors', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: doctors } = await doctorsResponse.json();

// 2. Get availability for selected doctor
const availabilityResponse = await fetch(
  `http://localhost:5000/api/appointments/doctors/${doctorId}/availability?date=2024-12-10`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const { data: availability } = await availabilityResponse.json();

// 3. Book appointment
const bookResponse = await fetch('http://localhost:5000/api/appointments/book', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    doctorId,
    date: '2024-12-10',
    time: '09:00 AM',
    slotId: 'selected_slot_id',
    reason: 'Regular checkup'
  })
});
const { data: appointment } = await bookResponse.json();
```

---

## 📝 Notes

- All dates use ISO 8601 format
- Time slots are automatically created when checking availability
- Booking an appointment marks the slot as unavailable
- Cancelling frees up the slot for other patients
- Rescheduling moves the booking to a new slot
- All monetary values are in the doctor's specified currency
- Default appointment duration is 30 minutes
- Patients can only view/manage their own appointments

---

## ✨ All Requirements Met!

✅ **7/7 Endpoints Implemented**
✅ **All validation and error handling**
✅ **Database models created**
✅ **Sample data seeded**
✅ **Complete documentation**
✅ **Ready for frontend integration**

---

**Server Status:** Running on http://localhost:5000 🚀

**Your Doctor Appointment API is complete and production-ready!** 🎊

