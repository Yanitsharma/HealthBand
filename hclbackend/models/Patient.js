import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // Real-time Activity Data
  todaysActivity: {
    steps: {
      current: { type: Number, default: 0 },
      goal: { type: Number, default: 10000 },
    },
    sleep: {
      current: { type: Number, default: 0 }, // hours
      goal: { type: Number, default: 8 },
    },
    water: {
      current: { type: Number, default: 0 }, // liters
      goal: { type: Number, default: 3 },
    },
    calories: {
      current: { type: Number, default: 0 }, // kcal
      goal: { type: Number, default: 700 },
    },
  },
  // Reminders for the dashboard list
  reminders: [{
    title: { type: String, required: true },
    category: { type: String, enum: ['Medication', 'Appointment', 'Workout', 'General'], default: 'General' },
    timeRemaining: String, // e.g. "2 hours"
    isCompleted: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
  }],
  // Profile & Tips
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  healthTips: [
    {
      tip: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp on save
patientSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Patient", patientSchema);