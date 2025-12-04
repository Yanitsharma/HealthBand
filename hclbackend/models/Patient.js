import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // Today's Activity
  todaysActivity: {
    steps: {
      current: { type: Number, default: 0 },
      goal: { type: Number, default: 10000 },
    },
    sleep: {
      current: { type: Number, default: 0 }, // in hours
      goal: { type: Number, default: 8 },
    },
    water: {
      current: { type: Number, default: 0 }, // in liters
      goal: { type: Number, default: 3 },
    },
    calories: {
      current: { type: Number, default: 0 }, // kcal
      goal: { type: Number, default: 700 },
    },
  },
  // Profile completion
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  // Health tips
  healthTips: [
    {
      tip: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp before saving
patientSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

export default mongoose.model("Patient", patientSchema);

