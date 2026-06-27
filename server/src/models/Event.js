import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    poster: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },
    deadline: { type: Date, required: true, index: true },
    eventDate: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    eligibility: { type: String, default: "Open to all students" },
    tags: [{ type: String, trim: true, lowercase: true }],
    category: { type: String, required: true, trim: true },
    clubName: { type: String, required: true, trim: true },
    clubAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "archived", "moderated"], default: "active", index: true },
    archiveReason: { type: String, default: "" },
    capacity: { type: Number, default: 0 },

    registrationCount: {
      type: Number,
      default: 0
    },

    waitlistCount: {
      type: Number,
      default: 0
    }
    
  },
  { timestamps: true }
);

eventSchema.index({ title: "text", description: "text", tags: "text", clubName: "text" });

export const Event = mongoose.model("Event", eventSchema);
