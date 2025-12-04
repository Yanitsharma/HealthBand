import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "./models/Doctor.js";

dotenv.config();

const seedDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log("Cleared existing doctors...");

    // Sample doctors data
    const doctors = [
      {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        experience: "15 years",
        rating: 4.8,
        totalReviews: 234,
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
        fees: 150,
        currency: "USD",
        qualifications: ["MBBS", "MD Cardiology", "FACC"],
        languages: ["English", "Spanish"],
        about:
          "Experienced cardiologist specializing in preventive cardiology and heart disease management. Committed to providing comprehensive cardiovascular care with a focus on patient education and lifestyle modifications.",
        email: "dr.sarah.johnson@healthband.com",
        phone: "+1-555-0101",
        address: "123 Medical Center, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. Michael Chen",
        specialty: "General Physician",
        experience: "10 years",
        rating: 4.7,
        totalReviews: 189,
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300",
        fees: 100,
        currency: "USD",
        qualifications: ["MBBS", "MD Internal Medicine"],
        languages: ["English", "Mandarin", "Cantonese"],
        about:
          "Dedicated general physician with expertise in primary care, preventive medicine, and chronic disease management. Provides comprehensive healthcare for patients of all ages.",
        email: "dr.michael.chen@healthband.com",
        phone: "+1-555-0102",
        address: "456 Primary Care Clinic, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. Emily Rodriguez",
        specialty: "Pediatrician",
        experience: "12 years",
        rating: 4.9,
        totalReviews: 312,
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300",
        fees: 120,
        currency: "USD",
        qualifications: ["MBBS", "MD Pediatrics", "FAAP"],
        languages: ["English", "Spanish", "Portuguese"],
        about:
          "Compassionate pediatrician specializing in child health and development. Expert in newborn care, vaccinations, and childhood illnesses with a gentle approach that puts children at ease.",
        email: "dr.emily.rodriguez@healthband.com",
        phone: "+1-555-0103",
        address: "789 Children's Medical Center, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. James Williams",
        specialty: "Orthopedic Surgeon",
        experience: "18 years",
        rating: 4.6,
        totalReviews: 156,
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300",
        fees: 200,
        currency: "USD",
        qualifications: ["MBBS", "MS Orthopedics", "FAAOS"],
        languages: ["English"],
        about:
          "Highly skilled orthopedic surgeon specializing in joint replacement, sports injuries, and trauma care. Uses advanced surgical techniques for optimal patient outcomes.",
        email: "dr.james.williams@healthband.com",
        phone: "+1-555-0104",
        address: "321 Orthopedic Center, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. Priya Patel",
        specialty: "Dermatologist",
        experience: "8 years",
        rating: 4.8,
        totalReviews: 201,
        image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300",
        fees: 130,
        currency: "USD",
        qualifications: ["MBBS", "MD Dermatology"],
        languages: ["English", "Hindi", "Gujarati"],
        about:
          "Board-certified dermatologist with expertise in medical, surgical, and cosmetic dermatology. Specializes in acne treatment, skin cancer screening, and anti-aging procedures.",
        email: "dr.priya.patel@healthband.com",
        phone: "+1-555-0105",
        address: "654 Skin Care Clinic, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. Robert Taylor",
        specialty: "Neurologist",
        experience: "20 years",
        rating: 4.9,
        totalReviews: 278,
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300",
        fees: 180,
        currency: "USD",
        qualifications: ["MBBS", "MD Neurology", "FAAN"],
        languages: ["English", "French"],
        about:
          "Renowned neurologist specializing in stroke care, epilepsy, and movement disorders. Pioneer in advanced neurological diagnostics and treatment protocols.",
        email: "dr.robert.taylor@healthband.com",
        phone: "+1-555-0106",
        address: "987 Neurology Institute, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. Lisa Anderson",
        specialty: "Psychiatrist",
        experience: "14 years",
        rating: 4.7,
        totalReviews: 165,
        image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300",
        fees: 140,
        currency: "USD",
        qualifications: ["MBBS", "MD Psychiatry"],
        languages: ["English", "German"],
        about:
          "Compassionate psychiatrist specializing in anxiety disorders, depression, and cognitive behavioral therapy. Provides holistic mental health care in a supportive environment.",
        email: "dr.lisa.anderson@healthband.com",
        phone: "+1-555-0107",
        address: "147 Mental Health Center, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. David Kim",
        specialty: "Ophthalmologist",
        experience: "11 years",
        rating: 4.8,
        totalReviews: 223,
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300",
        fees: 160,
        currency: "USD",
        qualifications: ["MBBS", "MS Ophthalmology"],
        languages: ["English", "Korean"],
        about:
          "Expert ophthalmologist specializing in cataract surgery, LASIK, and retinal diseases. Uses state-of-the-art technology for precise diagnosis and treatment.",
        email: "dr.david.kim@healthband.com",
        phone: "+1-555-0108",
        address: "258 Eye Care Center, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. Amanda Martinez",
        specialty: "Endocrinologist",
        experience: "9 years",
        rating: 4.6,
        totalReviews: 142,
        image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300",
        fees: 145,
        currency: "USD",
        qualifications: ["MBBS", "MD Endocrinology"],
        languages: ["English", "Spanish"],
        about:
          "Dedicated endocrinologist specializing in diabetes management, thyroid disorders, and hormonal imbalances. Focuses on personalized treatment plans for optimal metabolic health.",
        email: "dr.amanda.martinez@healthband.com",
        phone: "+1-555-0109",
        address: "369 Endocrine Clinic, Healthcare City, HC 12345",
        isAvailable: true,
      },
      {
        name: "Dr. Thomas Brown",
        specialty: "Gastroenterologist",
        experience: "16 years",
        rating: 4.7,
        totalReviews: 198,
        image: "https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=300",
        fees: 170,
        currency: "USD",
        qualifications: ["MBBS", "MD Gastroenterology", "FACG"],
        languages: ["English"],
        about:
          "Board-certified gastroenterologist with expertise in digestive disorders, liver diseases, and advanced endoscopic procedures. Committed to evidence-based care.",
        email: "dr.thomas.brown@healthband.com",
        phone: "+1-555-0110",
        address: "741 Digestive Health Center, Healthcare City, HC 12345",
        isAvailable: true,
      },
    ];

    // Insert doctors
    await Doctor.insertMany(doctors);
    console.log(`✅ Successfully seeded ${doctors.length} doctors!`);

    // Display seeded doctors
    console.log("\n📋 Seeded Doctors:");
    doctors.forEach((doc, index) => {
      console.log(
        `${index + 1}. ${doc.name} - ${doc.specialty} (${doc.experience})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding doctors:", error);
    process.exit(1);
  }
};

seedDoctors();

