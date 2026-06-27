import mongoose from "mongoose";

const eventWaitlistSchema =
  new mongoose.Schema(
    {
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
      },

      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    },
    {
      timestamps: true
    }
  );

export const EventWaitlist =
  mongoose.model(
    "EventWaitlist",
    eventWaitlistSchema
  );