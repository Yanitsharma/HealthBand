import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  fees: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  qualifications: [
    {
      type: String,
    },
  ],
  languages: [
    {
      type: String,
    },
  ],
  about: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Doctor", doctorSchema);

