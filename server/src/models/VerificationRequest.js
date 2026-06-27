import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true},
    rollNumber: { type: String, required: true, uppercase: true, trim: true },
    department: { type: String, required: true },
    year: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

export const VerificationRequest = mongoose.model("VerificationRequest", verificationRequestSchema);
