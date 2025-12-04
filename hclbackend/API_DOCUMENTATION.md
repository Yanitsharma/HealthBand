# HealthBand API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📍 Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User Profile
**GET** `/api/auth/me` 🔒 Protected

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🏥 Patient Dashboard Endpoints

### 1. Get Dashboard Data
**GET** `/api/patient/dashboard` 🔒 Protected

Gets all dashboard data including today's activity, reminders, and health tip.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "John Doe",
      "username": "johndoe",
      "profileCompletion": 75
    },
    "todaysActivity": {
      "steps": {
        "current": 6520,
        "goal": 10000
      },
      "sleep": {
        "current": 6.5,
        "goal": 8
      },
      "water": {
        "current": 1.8,
        "goal": 3
      },
      "calories": {
        "current": 480,
        "goal": 700
      }
    },
    "reminders": [
      {
        "_id": "...",
        "title": "Upcoming blood test",
        "category": "Lab",
        "dueDate": "2024-01-17T10:00:00.000Z",
        "timeRemaining": "In 2 days",
        "notes": "Fasting required"
      }
    ],
    "healthTip": "Take a 5-minute walk every hour to improve circulation and reduce stiffness."
  }
}
```

---

## 🎯 Goals Management

### 2. Update Daily Goals
**PUT** `/api/patient/goals` 🔒 Protected

Update your daily health goals (steps, sleep, water, calories).

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:** (all fields are optional)
```json
{
  "steps": 12000,
  "sleep": 8,
  "water": 3.5,
  "calories": 800
}
```

**Response:**
```json
{
  "success": true,
  "message": "Goals updated successfully",
  "data": {
    "steps": {
      "current": 6520,
      "goal": 12000
    },
    "sleep": {
      "current": 6.5,
      "goal": 8
    },
    "water": {
      "current": 1.8,
      "goal": 3.5
    },
    "calories": {
      "current": 480,
      "goal": 800
    }
  }
}
```

---

## 📊 Activity Tracking

### 3. Update Today's Activity
**PUT** `/api/patient/activity` 🔒 Protected

Update your current activity progress for today.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:** (all fields are optional)
```json
{
  "steps": 8500,
  "sleep": 7.5,
  "water": 2.2,
  "calories": 550
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activity updated successfully",
  "data": {
    "steps": {
      "current": 8500,
      "goal": 10000
    },
    "sleep": {
      "current": 7.5,
      "goal": 8
    },
    "water": {
      "current": 2.2,
      "goal": 3
    },
    "calories": {
      "current": 550,
      "goal": 700
    }
  }
}
```

### 4. Reset Daily Activity
**POST** `/api/patient/reset-daily` 🔒 Protected

Resets all current activity values to 0 (useful for testing or daily reset).

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Daily activity reset successfully",
  "data": {
    "steps": { "current": 0, "goal": 10000 },
    "sleep": { "current": 0, "goal": 8 },
    "water": { "current": 0, "goal": 3 },
    "calories": { "current": 0, "goal": 700 }
  }
}
```

---

## 🔔 Reminders Management

### 5. Add a Reminder
**POST** `/api/patient/reminders` 🔒 Protected

Add a new health reminder.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "title": "Upcoming blood test",
  "category": "Lab",
  "dueDate": "2024-12-10T09:00:00.000Z",
  "timeOfDay": "morning",
  "notes": "Fasting required - no food after 8pm"
}
```

**Categories:** `Lab`, `Checkup`, `Diabetes`, `Cardio`, `Medicine`, `Other`

**Response:**
```json
{
  "success": true,
  "message": "Reminder added successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "title": "Upcoming blood test",
    "category": "Lab",
    "dueDate": "2024-12-10T09:00:00.000Z",
    "timeOfDay": "morning",
    "notes": "Fasting required - no food after 8pm",
    "isCompleted": false,
    "createdAt": "2024-12-04T10:00:00.000Z"
  }
}
```

### 6. Get All Reminders
**GET** `/api/patient/reminders` 🔒 Protected

Get all reminders for the logged-in user.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `completed` (optional): `true` or `false` to filter by completion status

**Example:** `/api/patient/reminders?completed=false`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Upcoming blood test",
      "category": "Lab",
      "dueDate": "2024-12-10T09:00:00.000Z",
      "timeRemaining": "In 6 days",
      "timeOfDay": "morning",
      "notes": "Fasting required",
      "isCompleted": false
    },
    {
      "_id": "...",
      "title": "Eye checkup",
      "category": "Checkup",
      "dueDate": "2024-12-15T14:00:00.000Z",
      "timeRemaining": "In 11 days",
      "timeOfDay": "afternoon",
      "notes": null,
      "isCompleted": false
    }
  ]
}
```

### 7. Update a Reminder
**PUT** `/api/patient/reminders/:id` 🔒 Protected

Update an existing reminder.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:** (all fields are optional)
```json
{
  "title": "Blood test - Updated",
  "category": "Lab",
  "dueDate": "2024-12-11T09:00:00.000Z",
  "timeOfDay": "morning",
  "notes": "Updated notes",
  "isCompleted": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reminder updated successfully",
  "data": {
    "_id": "...",
    "title": "Blood test - Updated",
    "category": "Lab",
    "dueDate": "2024-12-11T09:00:00.000Z",
    "isCompleted": true
  }
}
```

### 8. Delete a Reminder
**DELETE** `/api/patient/reminders/:id` 🔒 Protected

Delete a reminder.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Reminder deleted successfully"
}
```

---

## 🧪 Testing Workflow in Postman

### Step 1: Register/Login
1. Register a new user or login to get a token
2. Copy the token from the response

### Step 2: Test Dashboard (Empty State)
1. GET `/api/patient/dashboard`
2. Add token in Authorization header
3. You'll see default values with 0 current activity

### Step 3: Set Your Goals
1. PUT `/api/patient/goals`
2. Set your daily goals:
```json
{
  "steps": 10000,
  "sleep": 8,
  "water": 3,
  "calories": 700
}
```

### Step 4: Update Activity
1. PUT `/api/patient/activity`
2. Update your current progress:
```json
{
  "steps": 6520,
  "sleep": 6.5,
  "water": 1.8,
  "calories": 480
}
```

### Step 5: Add Reminders
1. POST `/api/patient/reminders`
2. Add multiple reminders:

**Blood Test:**
```json
{
  "title": "Upcoming blood test",
  "category": "Lab",
  "dueDate": "2024-12-10T09:00:00.000Z",
  "notes": "Fasting required"
}
```

**Eye Checkup:**
```json
{
  "title": "Upcoming eye test / full body test",
  "category": "Checkup",
  "dueDate": "2024-12-12T14:00:00.000Z"
}
```

**Sugar Level Test:**
```json
{
  "title": "Sugar level test",
  "category": "Diabetes",
  "dueDate": "2024-12-05T08:00:00.000Z",
  "timeOfDay": "morning"
}
```

### Step 6: View Complete Dashboard
1. GET `/api/patient/dashboard`
2. You'll now see all your data populated!

### Step 7: Manage Reminders
- GET `/api/patient/reminders` - View all
- PUT `/api/patient/reminders/:id` - Mark as complete
- DELETE `/api/patient/reminders/:id` - Delete

---

## 📝 Notes

- All protected routes require a valid JWT token
- Token expires in 30 days
- All dates should be in ISO 8601 format
- Activity values are automatically created with default 0 values on first dashboard access
- Health tips are randomized from a pool of wellness tips
- Time remaining for reminders is calculated automatically

---

## 🎨 UI Integration

The dashboard endpoint returns all the data needed for the HealthBand UI:
- Today's activity metrics with progress bars
- Health reminders sorted by due date
- Random health tip of the day
- User profile information

Perfect for frontend integration! 🚀

