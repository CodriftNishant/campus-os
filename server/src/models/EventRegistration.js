import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: [
        "registered",
        "waitlisted",
        "cancelled"
      ],
      default: "registered"
    },
    attendanceStatus: {
      type: String,
      enum: ["present", "absent"],
      default: "absent"
    },
    qrCode: {
    type: String,
    default: ""
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
      
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

export const EventRegistration = mongoose.model("EventRegistration", eventRegistrationSchema);
