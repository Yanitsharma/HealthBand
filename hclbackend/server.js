import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./Routes/userRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import patientRoutes from "./Routes/patientRoutes.js";
import appointmentRoutes from "./Routes/appointmentRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "HealthBand API - Your daily wellness snapshot",
    version: "2.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        getProfile: "GET /api/auth/me (Protected)",
      },
      patient: {
        dashboard: "GET /api/patient/dashboard (Protected)",
        updateGoals: "PUT /api/patient/goals (Protected)",
        updateActivity: "PUT /api/patient/activity (Protected)",
        resetDaily: "POST /api/patient/reset-daily (Protected)",
        addReminder: "POST /api/patient/reminders (Protected)",
        getReminders: "GET /api/patient/reminders (Protected)",
        updateReminder: "PUT /api/patient/reminders/:id (Protected)",
        deleteReminder: "DELETE /api/patient/reminders/:id (Protected)",
      },
      appointments: {
        getDoctors: "GET /api/appointments/doctors (Protected)",
        getDoctorAvailability: "GET /api/appointments/doctors/:doctorId/availability (Protected)",
        bookAppointment: "POST /api/appointments/book (Protected)",
        getMyAppointments: "GET /api/appointments/my-appointments (Protected)",
        getAppointmentDetails: "GET /api/appointments/:appointmentId (Protected)",
        cancelAppointment: "PUT /api/appointments/:appointmentId/cancel (Protected)",
        rescheduleAppointment: "PUT /api/appointments/:appointmentId/reschedule (Protected)",
      },
      users: {
        getAllUsers: "GET /api/users",
        createUser: "POST /api/users",
      },
    },
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
