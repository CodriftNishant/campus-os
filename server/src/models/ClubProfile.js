import mongoose from "mongoose";

const clubProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    clubName: { type: String, required: true, trim: true, unique: true},
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ClubProfile = mongoose.model("ClubProfile", clubProfileSchema);
