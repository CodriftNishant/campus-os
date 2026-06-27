import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["system", "event", "verification", "registration"], default: "system" },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
