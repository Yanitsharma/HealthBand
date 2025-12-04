import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Lab", "Checkup", "Diabetes", "Cardio", "Medicine", "Other"],
    default: "Other",
  },
  dueDate: {
    type: Date,
    required: true,
  },
  timeOfDay: {
    type: String, // e.g., "morning", "afternoon", "evening"
  },
  notes: {
    type: String,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Reminder", reminderSchema);

