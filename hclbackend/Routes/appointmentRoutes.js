import express from "express";
import {
  getDoctors,
  getDoctorAvailability,
  bookAppointment,
  getMyAppointments,
  getAppointmentDetails,
  cancelAppointment,
  rescheduleAppointment,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Doctor routes
router.get("/doctors", getDoctors);
router.get("/doctors/:doctorId/availability", getDoctorAvailability);

// Appointment booking
router.post("/book", bookAppointment);

// Patient appointments
router.get("/my-appointments", getMyAppointments);
router.get("/:appointmentId", getAppointmentDetails);

// Appointment management
router.put("/:appointmentId/cancel", cancelAppointment);
router.put("/:appointmentId/reschedule", rescheduleAppointment);

export default router;

