import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
  },
  reason: {
    type: String,
    required: true,
  },
  patientNotes: {
    type: String,
  },
  status: {
    type: String,
    enum: ["confirmed", "completed", "cancelled", "rescheduled"],
    default: "confirmed",
  },
  fees: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "paid",
  },
  location: {
    type: String,
    default: "Clinic Room",
  },
  duration: {
    type: String,
    default: "30 minutes",
  },
  instructions: {
    type: String,
    default: "Please arrive 15 minutes early. Bring any previous medical records.",
  },
  cancellationReason: {
    type: String,
  },
  refundAmount: {
    type: Number,
  },
  refundStatus: {
    type: String,
    enum: ["none", "processing", "completed"],
    default: "none",
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  // For rescheduling history
  previousAppointments: [
    {
      date: Date,
      time: String,
      modifiedAt: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
appointmentSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

export default mongoose.model("Appointment", appointmentSchema);

