import express from "express";
import {
  getDashboard,
  updateGoals,
  updateActivity,
  addReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  resetDailyActivity,
} from "../controllers/patientController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Dashboard
router.get("/dashboard", getDashboard);

// Goals management
router.put("/goals", updateGoals);

// Activity tracking
router.put("/activity", updateActivity);
router.post("/reset-daily", resetDailyActivity);

// Reminders management
router.post("/reminders", addReminder);
router.get("/reminders", getReminders);
router.put("/reminders/:id", updateReminder);
router.delete("/reminders/:id", deleteReminder);

export default router;

