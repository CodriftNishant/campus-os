import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { ClubProfile } from "../models/ClubProfile.js";
import { Event } from "../models/Event.js";
import { Interest } from "../models/Interest.js";
import { VerificationRequest } from "../models/VerificationRequest.js";

dotenv.config();

const run = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    ClubProfile.deleteMany({}),
    Event.deleteMany({}),
    Interest.deleteMany({}),
    VerificationRequest.deleteMany({})
  ]);

  const admin = await User.create({ name: "Super Admin", email: "admin@campus.test", password: "Admin@12345", role: "super_admin" });
  const clubUser = await User.create({ name: "Coding Club Admin", email: "codingclub@campus.test", password: "Club@12345", role: "club_admin" });
  const student = await User.create({ name: "Aarav Student", email: "student@campus.test", password: "Student@12345", role: "student" });

  await ClubProfile.create({
    user: clubUser._id,
    clubName: "Coding Club",
    category: "Technology",
    description: "Build, ship, and learn software with peers.",
    contactEmail: "codingclub@campus.test",
    isApproved: true
  });



  await StudentProfile.create({
    user: student._id,
    rollNumber: "CSE2026001",
    department: "Computer Science",
    year: 2,
    phoneNumber: "9999999999",
    interests: ["web development", "ai", "hackathon"],
    verificationStatus: "verified"
  });

  await VerificationRequest.create({
    student: student._id,
    rollNumber: "CSE2026001",
    department: "Computer Science",
    year: 2,
    status: "approved",
    reviewedBy: admin._id,
    reviewedAt: new Date()
  });

  await Interest.insertMany(["web development", "ai", "hackathon", "design", "robotics", "music", "entrepreneurship"].map((name) => ({ name })));

  await Event.insertMany([
    {
      title: "AI Product Hackathon",
      description: "A 24-hour product sprint for students interested in artificial intelligence, APIs, and real-world problem solving.",
      deadline: new Date(Date.now() + 5 * 86400000),
      eventDate: new Date(Date.now() + 8 * 86400000),
      venue: "Innovation Lab",
      eligibility: "Open to all verified students",
      tags: ["ai", "hackathon", "web development"],
      category: "Technology",
      clubName: "Coding Club",
      clubAdmin: clubUser._id,
      capacity: 120
    },
    {
      title: "Portfolio Website Jam",
      description: "Design and build a resume-ready personal portfolio with React, Tailwind, and deployment best practices.",
      deadline: new Date(Date.now() + 3 * 86400000),
      eventDate: new Date(Date.now() + 6 * 86400000),
      venue: "Seminar Hall B",
      eligibility: "First year and above",
      tags: ["web development", "design"],
      category: "Technology",
      clubName: "Coding Club",
      clubAdmin: clubUser._id,
      capacity: 80
    }
  ]);

  console.log("Seed complete");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
