import cron from "node-cron";
import { Event } from "../models/Event.js";
import { EventRegistration } from "../models/EventRegistration.js";
import { sendEmail } from "../services/emailService.js";

export const startReminderJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log(
      "Reminder job running at",
      new Date().toLocaleTimeString()
    );
    const now = new Date();

    const next24Hours = new Date(
        now.getTime() + 24 * 60 * 60 * 1000
    );

    const upcomingEvents =
        await Event.find({
        eventDate: {
            $gte: now,
            $lte: next24Hours
        },
        status: "active"
        });

    console.log(
        "Upcoming events found:",
        upcomingEvents.length
    );
    for (const event of upcomingEvents) {

    const registrations =
    await EventRegistration.find({
        event: event._id,
        status: "registered",
        reminderSent: {
        $ne: true
        }
    }).populate("student");

    console.log(
        event.title,
        "Registrations:",
        registrations.length
    );

    for (const registration of registrations) {

        await sendEmail({
            to: process.env.EMAIL_USER,
            subject: `Reminder: ${event.title}`,
            html: `
            <h2>Event Reminder</h2>

            <p>Your event <b>${event.title}</b>
            starts within 24 hours.</p>

            <p><b>Venue:</b> ${event.venue}</p>

            <p><b>Date:</b>
            ${new Date(event.eventDate)
                .toLocaleString()}</p>

            <p>See you there!</p>
            `
        });

        registration.reminderSent = true;
        await registration.save();

        console.log(
            "Reminder email sent for:",
            event.title
        );
        }
    }
  });

  console.log("Reminder scheduler started");
};