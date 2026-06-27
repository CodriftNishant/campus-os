import { Event } from "../models/Event.js";
import { EventRegistration } from "../models/EventRegistration.js";
import { EventWaitlist } from "../models/EventWaitlist.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../services/notificationService.js";
import { getIO } from "../socket.js";
import QRCode from "qrcode";

export const registerForEvent = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (profile?.verificationStatus !== "verified") throw new ApiError(403, "Verify your roll number before registering for events");
  const event = await Event.findOne({ _id: req.params.eventId, status: "active", deadline: { $gt: new Date() } });
  if (!event) throw new ApiError(404, "Event is unavailable or registration deadline has passed");
  if (new Date() > new Date(event.eventDate))
  throw new ApiError(400, "Event has already ended");

    const existingRegistration = await EventRegistration.findOne({
    event: event._id,
    student: req.user._id
  });

  if (existingRegistration?.status === "registered") {
    throw new ApiError(409, "You are already registered for this event");
  }

  if (existingRegistration?.status === "waitlisted") {
    const waitlistPosition = await EventRegistration.countDocuments({
      event: event._id,
      status: "waitlisted",
      createdAt: { $lte: existingRegistration.createdAt }
    });

    return res.status(200).json({
      success: true,
      waitlisted: true,
      position: waitlistPosition,
      message: "You are already on the waitlist"
    });
  }

  if (
    event.capacity &&
    event.registrationCount >= event.capacity
  ) {

    console.log(
      "REGISTER REQUEST:",
      req.user._id.toString()
    );

    const registration =
      await EventRegistration.findOneAndUpdate(
        {
          event: event._id,
          student: req.user._id
        },
        {
          status: "waitlisted"
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
    console.log(
      "REGISTRATION STATUS:",
      registration.status
    );

    event.waitlistCount =
      await EventRegistration.countDocuments({
        event: event._id,
        status: "waitlisted"
      });

    await event.save();

    return res.status(200).json({
      success: true,
      waitlisted: true,
      position: event.waitlistCount,
      message: "Added to waitlist"
    });
  }
  const registration = await EventRegistration.findOneAndUpdate(
    { event: event._id, student: req.user._id },
    { status: "registered" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

   const qrPayload = JSON.stringify({
        registrationId: registration._id,
        eventId: event._id,
        studentId: req.user._id
      });

      const qrCode = await QRCode.toDataURL(
        qrPayload
      );
      console.log(
        "QR GENERATED:",
        qrCode.substring(0, 50)
      );
      registration.qrCode = qrCode;
      await registration.save();
      console.log(
        "QR SAVED:",
        registration._id
      );

  event.registrationCount = await EventRegistration.countDocuments({ event: event._id, status: "registered" });
  await event.save();
  await createNotification({ user: req.user._id, title: "Registration confirmed", message: `You registered for ${event.title}.`, type: "registration", link: `/events/${event._id}` });
  const io = getIO();

  console.log(
    "EMITTING TO:",
    `club_${event.clubAdmin}`
  );

  console.log({
    eventId: event._id,
    registrationCount: event.registrationCount,
    eventTitle: event.title
  });
  
  io.to(`club_${event.clubAdmin}`).emit(
    "registration_update",
    {
      eventId: event._id,
      registrationCount:
        event.registrationCount,
      eventTitle: event.title
    }
  );

  io.to(`event_${event._id}`).emit(
    "event_registration_update",
    {
      eventId: event._id,
      registrationCount:
        event.registrationCount
    }
  );
  console.log(
    "EVENT ROOM UPDATE:",
    `event_${event._id}`
  );

  res.status(201).json(registration);
});

export const unregisterFromEvent = asyncHandler(async (req, res) => {

  const event = await Event.findById(req.params.eventId);

  if (!event)
    throw new ApiError(404, "Event not found");

  if (new Date() > new Date(event.eventDate))
    throw new ApiError(400, "Event has already ended");

  const registration = await EventRegistration.findOneAndUpdate(
    {
      event: req.params.eventId,
      student: req.user._id,
      status: "registered"
    },
    {
      status: "cancelled"
    },
    {
      new: true
    }
  );

  if (!registration)
    throw new ApiError(404, "Registration not found");
  const io = getIO();
  const nextWaitlistedStudent =
    await EventRegistration.findOne({
      event: req.params.eventId,
      status: "waitlisted"
    }).sort({ createdAt: 1 });
    if (nextWaitlistedStudent) {

    nextWaitlistedStudent.status =
      "registered";

    await nextWaitlistedStudent.save();
    await createNotification({
      user: nextWaitlistedStudent.student,
      title: "Waitlist Promotion",
      message: `You have been promoted from the waitlist for ${event.title}`,
      type: "registration",
      link: `/events/${event._id}`
    });
    io.to(
      `user_${nextWaitlistedStudent.student}`
    ).emit(
      "new_notification",
      {
        title: "Waitlist Promotion",
        message: `You have been promoted from the waitlist for ${event.title}`,
        type: "registration",
        link: `/events/${event._id}`
      }
    );
    console.log(
      "PROMOTED FROM WAITLIST:",
      nextWaitlistedStudent.student
    );
  }
    const count = await EventRegistration.countDocuments({
    event: req.params.eventId,
    status: "registered"
  });

  const waitlistCount =
    await EventRegistration.countDocuments({
      event: req.params.eventId,
      status: "waitlisted"
    });

  await Event.findByIdAndUpdate(
    req.params.eventId,
    {
      registrationCount: count,
      waitlistCount
    }
  );

  io.to(`club_${event.clubAdmin}`).emit(
    "registration_update",
    {
      eventId: event._id,
      registrationCount: count,
      eventTitle: event.title
    }
  );

  io.to(`event_${event._id}`).emit(
    "event_registration_update",
    {
      eventId: event._id,
      registrationCount: count
    }
  );

  console.log(
    "EVENT ROOM UPDATE:",
    `event_${event._id}`
  );
  
  console.log(
    "UNREGISTER EMITTING TO:",
    `club_${event.clubAdmin}`
  );

  console.log({
    eventId: event._id,
    registrationCount: count,
    eventTitle: event.title
  });
  res.json({
    message: "Registration cancelled"
  });
});

export const myRegistrations = asyncHandler(async (req, res) => {
  const registrations = await EventRegistration.find({ student: req.user._id, status: "registered" }).populate("event").sort({ createdAt: -1 });
  res.json(
  registrations.filter(
    (item) =>
      item.event &&
      item.event.status === "active" &&
      new Date(item.event.deadline) > new Date()
  )
);
});
