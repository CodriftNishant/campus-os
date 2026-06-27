import mongoose from "mongoose";

const recommendationCacheSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    eventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    reasonMap: { type: Map, of: String },
    scoreMap: { type: Map, of: Number },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

recommendationCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RecommendationCache = mongoose.model("RecommendationCache", recommendationCacheSchema);
