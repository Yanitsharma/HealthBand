import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; // 1. Import HTTP
import { Server } from "socket.io"; // 2. Import Socket.io
import connectDB from "./config/db.js";
import { startSimulation } from './simulator.js';
// Routes Imports
import userRoutes from "./Routes/userRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import patientRoutes from "./Routes/patientRoutes.js";
import appointmentRoutes from "./Routes/appointmentRoutes.js";

// Model Import (Required for the simulator to update DB)
// Make sure this path matches where you saved the schema from the previous step
import Patient from "./models/Patient.js"; 

dotenv.config();
connectDB();

const app = express();

// 3. Create HTTP Server & Wrap Express
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL of your React Frontend
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------------------
// SOCKET.IO LOGIC (Real-time Connection)
// -------------------------------------------------------------------------
io.on("connection", (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  // Join a specific user room (secure channel for that user)
  socket.on("join-room", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket Disconnected");
  });
});

// -------------------------------------------------------------------------
// SIMULATOR ROUTE (Updates DB & Pushes Real-time Data)
// -------------------------------------------------------------------------
app.post("/api/simulate/update", async (req, res) => {
  const { userId, type, value } = req.body;

  if (!userId || !type || value === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Construct the nested path dynamically (e.g., 'todaysActivity.steps.current')
    const updatePath = `todaysActivity.${type}.current`;
    const updateQuery = {};
    updateQuery[updatePath] = value;

    // 2. Update the Database
    const updatedPatient = await Patient.findOneAndUpdate(
      { userId: userId },
      { $set: updateQuery },
      { 
        new: true, 
        upsert: true, // <--- ADD THIS LINE (Creates the record if missing)
        setDefaultsOnInsert: true // <--- OPTIONAL: Ensures default values (goals, etc.) are set
      } 
    );

    if (updatedPatient) {
      // 3. Push Real-Time Update to Frontend
      // We emit the entire todaysActivity object so frontend stays synced
      io.to(userId).emit("activity-update", updatedPatient.todaysActivity);
      
      return res.json({ success: true, message: "Data updated and emitted" });
    } else {
      return res.status(404).json({ error: "Patient record not found" });
    }
  } catch (error) {
    console.error("Simulation Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------------------
// EXISTING ROUTES
// -------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "HealthBand API - Your daily wellness snapshot",
    version: "2.0.0",
    socket_status: "Active",
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
      simulator: {
        update: "POST /api/simulate/update (Dev Only)",
      }
    },
  });
});

// 5. Start Server (Use server.listen instead of app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} with Socket.io enabled`)
);
