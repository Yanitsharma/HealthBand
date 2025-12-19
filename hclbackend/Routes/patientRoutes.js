import express from "express";
import {
  getDashboard,
  updateActivity,
  addReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  resetDailyActivity,
} from "../controllers/patientController.js";
import { protect } from "../middleware/auth.js";
import Patient from "../models/Patient.js"; // Import Patient model

const router = express.Router();

// Protect all routes
router.use(protect);

// Dashboard Route
router.get("/dashboard", getDashboard);

// -------------------------------------------------------
// ✅ FIXED GOALS ROUTE (Solves 'next is not a function')
// -------------------------------------------------------
router.put("/goals", async (req, res) => {
  try {
    const { steps, sleep, water, calories } = req.body;
    
    // Get the logged-in user's ID from the 'protect' middleware
    const userId = req.user._id; 

    // Find the patient and update specific goal fields
    const updatedPatient = await Patient.findOneAndUpdate(
      { userId: userId },
      {
        $set: {
          "todaysActivity.steps.goal": steps,
          "todaysActivity.sleep.goal": sleep,
          "todaysActivity.water.goal": water,
          "todaysActivity.calories.goal": calories,
        },
      },
      { new: true, upsert: true } // Create if it doesn't exist
    );

    res.json({ success: true, data: updatedPatient });
    
  } catch (error) {
    console.error("Goals Update Error:", error);
    // Send a proper error response instead of crashing
    res.status(500).json({ success: false, error: error.message });
  }
});
// -------------------------------------------------------

// Other Routes
router.put("/activity", updateActivity);
router.post("/reset-daily", resetDailyActivity);
router.post("/reminders", addReminder);
router.get("/reminders", getReminders);
router.put("/reminders/:id", updateReminder);
router.delete("/reminders/:id", deleteReminder);

export default router;