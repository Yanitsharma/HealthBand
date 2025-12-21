import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; 
import { Server } from "socket.io"; 
import connectDB from "./config/db.js";
import { startSimulation } from './simulator.js'; 

// Routes Imports
import userRoutes from "./Routes/userRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import patientRoutes from "./Routes/patientRoutes.js";
import appointmentRoutes from "./Routes/appointmentRoutes.js";

// Model Import
import Patient from "./models/Patient.js"; 

dotenv.config();
connectDB();

const app = express();

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io with ROBUST CORS
const io = new Server(server, {
  cors: {
    // Allow BOTH ports to prevent future errors if Vite switches back to 5173
    origin: [
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://healthband-2.onrender.com" ,// Update this with your ACTUAL Render URL
        "https://healthbband.vercel.app"
    ],
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------------------
// SOCKET.IO LOGIC
// -------------------------------------------------------------------------
io.on("connection", (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  socket.on("join-room", (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket Disconnected");
  });
});

// -------------------------------------------------------------------------
// SIMULATOR ROUTE
// -------------------------------------------------------------------------
app.post("/api/simulate/update", async (req, res) => {
  const { userId, type, value } = req.body;

  if (!userId || !type || value === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const updatePath = `todaysActivity.${type}.current`;
    const updateQuery = {};
    updateQuery[updatePath] = value;

    const updatedPatient = await Patient.findOneAndUpdate(
      { userId: userId },
      { $set: updateQuery },
      { new: true, upsert: true, setDefaultsOnInsert: true } 
    );

    if (updatedPatient) {
      // Emit update to frontend via WebSocket
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
// ROUTES
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
      auth: { register: "POST /api/auth/register", login: "POST /api/auth/login" },
      simulator: { update: "POST /api/simulate/update (Dev Only)" }
    },
  });
});

// 3. Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with Socket.io enabled`);
  
  // Start the simulator logic (Runs in background)
  startSimulation(); 
});