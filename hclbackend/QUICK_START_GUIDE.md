# 🚀 HealthBand API - Quick Start Guide

## ✅ What's Been Created

### 📁 Project Structure
```
hclbackend/
├── models/
│   ├── Users.js          # User authentication model
│   ├── Patient.js        # Patient health data model
│   └── Reminder.js       # Health reminders model
├── controllers/
│   ├── authController.js     # Login/Register logic
│   ├── patientController.js  # Dashboard & health tracking
│   └── userController.js     # User management
├── Routes/
│   ├── authRoutes.js     # /api/auth/*
│   ├── patientRoutes.js  # /api/patient/*
│   └── userRoutes.js     # /api/users/*
├── middleware/
│   └── auth.js           # JWT authentication
├── config/
│   └── db.js             # MongoDB connection
├── server.js             # Main server file
├── API_DOCUMENTATION.md  # Complete API docs
└── HealthBand_Postman_Collection.json  # Postman collection
```

### 🎯 Features Implemented

✅ **User Authentication**
- Register with username, name, email, password
- Login with email & password
- JWT token-based authentication
- Protected routes

✅ **Patient Dashboard**
- Get complete dashboard data
- Today's activity tracking (steps, sleep, water, calories)
- Daily goals management
- Health reminders with categories
- Random health tips

✅ **Activity Tracking**
- Update current activity progress
- Set and update daily goals
- Reset daily activity

✅ **Health Reminders**
- Add reminders with categories (Lab, Checkup, Diabetes, etc.)
- View all reminders
- Update reminders (mark complete)
- Delete reminders
- Automatic time remaining calculation

---

## 🧪 Testing in Postman

### Method 1: Import Postman Collection (Easiest!)

1. Open Postman
2. Click **Import** (top left)
3. Select **File**
4. Choose `HealthBand_Postman_Collection.json`
5. Collection will be imported with all endpoints ready!

The collection automatically:
- Saves your token after login/register
- Uses the token in all protected routes
- Has pre-filled example data

### Method 2: Manual Testing

#### Step 1: Register a User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123"
}
```
**Copy the token from response!**

#### Step 2: Get Dashboard (Empty)
```
GET http://localhost:5000/api/patient/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```
You'll see default values with 0 activity.

#### Step 3: Set Your Goals
```
PUT http://localhost:5000/api/patient/goals
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "steps": 10000,
  "sleep": 8,
  "water": 3,
  "calories": 700
}
```

#### Step 4: Update Activity Progress
```
PUT http://localhost:5000/api/patient/activity
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "steps": 6520,
  "sleep": 6.5,
  "water": 1.8,
  "calories": 480
}
```

#### Step 5: Add Health Reminders
```
POST http://localhost:5000/api/patient/reminders
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Upcoming blood test",
  "category": "Lab",
  "dueDate": "2024-12-10T09:00:00.000Z",
  "notes": "Fasting required"
}
```

Add more reminders:
- Eye test / full body test (Checkup category)
- Sugar level test (Diabetes category)

#### Step 6: View Complete Dashboard
```
GET http://localhost:5000/api/patient/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```
Now you'll see all your data populated! 🎉

---

## 📊 Dashboard Response Example

```json
{
  "success": true,
  "data": {
    "user": {
      "name": "Test User",
      "username": "testuser",
      "profileCompletion": 0
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
        "dueDate": "2024-12-10T09:00:00.000Z",
        "timeRemaining": "In 6 days",
        "notes": "Fasting required"
      }
    ],
    "healthTip": "Take a 5-minute walk every hour to improve circulation."
  }
}
```

---

## 🔑 All Available Endpoints

### Authentication (No token required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints (Require token)
- `GET /api/auth/me` - Get current user profile
- `GET /api/patient/dashboard` - Get complete dashboard
- `PUT /api/patient/goals` - Update daily goals
- `PUT /api/patient/activity` - Update activity progress
- `POST /api/patient/reset-daily` - Reset daily activity
- `POST /api/patient/reminders` - Add reminder
- `GET /api/patient/reminders` - Get all reminders
- `PUT /api/patient/reminders/:id` - Update reminder
- `DELETE /api/patient/reminders/:id` - Delete reminder

---

## 💡 Tips

1. **Token Management**: After login/register, save the token. It expires in 30 days.

2. **Date Format**: Use ISO 8601 format for dates:
   ```
   2024-12-10T09:00:00.000Z
   ```

3. **Categories**: Valid reminder categories are:
   - Lab
   - Checkup
   - Diabetes
   - Cardio
   - Medicine
   - Other

4. **Time Remaining**: Automatically calculated based on due date:
   - "Today", "Tomorrow", "In 2 days", "Next week", etc.

5. **Health Tips**: Randomly selected from a pool of 10 wellness tips.

6. **Activity Reset**: Use `/api/patient/reset-daily` to reset all current values to 0 (useful for testing or daily reset).

---

## 🎨 Frontend Integration

The `/api/patient/dashboard` endpoint returns everything needed for the UI:

```javascript
// Example fetch
const response = await fetch('http://localhost:5000/api/patient/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();

// Use data.todaysActivity for activity cards
// Use data.reminders for reminder list
// Use data.healthTip for tip of the day
// Use data.user for profile info
```

---

## 🐛 Troubleshooting

**401 Unauthorized Error**
- Check if token is included in Authorization header
- Format: `Bearer YOUR_TOKEN_HERE`
- Token might be expired (30 days)

**404 Not Found**
- Check URL spelling
- Ensure server is running on port 5000
- Check if route is protected (needs token)

**500 Server Error**
- Check MongoDB connection
- Check server logs for detailed error

---

## 📚 Documentation

For complete API documentation with all request/response examples, see:
- `API_DOCUMENTATION.md`

---

## ✨ Ready to Use!

Your HealthBand API is fully functional and ready for:
- Frontend integration
- Mobile app development
- Testing and demonstration

Server is running on: **http://localhost:5000** 🚀

Happy coding! 💙

