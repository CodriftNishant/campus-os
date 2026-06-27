import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, default: "general" }
  },
  { timestamps: true }
);

export const Interest = mongoose.model("Interest", interestSchema);
