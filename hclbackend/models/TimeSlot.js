import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  slotId: {
    type: String,
    required: true,
    unique: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for faster queries
timeSlotSchema.index({ doctorId: 1, date: 1, time: 1 });

export default mongoose.model("TimeSlot", timeSlotSchema);

