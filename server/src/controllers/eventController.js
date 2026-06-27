import { Event } from "../models/Event.js";
import { EventRegistration } from "../models/EventRegistration.js";
import { ClubProfile } from "../models/ClubProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageBuffer,  deleteImage } from "../services/cloudinaryService.js";
import { Notification } from "../models/Notification.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { getIO } from "../socket.js";
import ExcelJS from "exceljs";

const ensureOwner = (event, user) => {
  if (user.role !== "super_admin" && String(event.clubAdmin) !== String(user._id)) throw new ApiError(403, "Only the owning club can modify this event");
};

export const listEvents = asyncHandler(async (req, res) => {
  const { search, club, category, interest, from, to, includeArchived } = req.query;
  const query = includeArchived === "true" && req.user?.role === "super_admin" ? {} : { status: "active", deadline: { $gt: new Date() } };
  if (search) query.$text = { $search: search };
  if (club) query.clubName = new RegExp(club, "i");
  if (category) query.category = new RegExp(category, "i");
  if (interest) query.tags = interest.toLowerCase();
  if (from || to) query.eventDate = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) };
  const events = await Event.find(query).sort({ eventDate: 1 });
  res.json(events);
});

export const listMyClubEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ clubAdmin: req.user._id }).sort({ createdAt: -1 });
  res.json(events);
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) throw new ApiError(404, "Event not found");

  if (
    event.status !== "active" &&
    req.user?.role !== "super_admin" &&
    String(event.clubAdmin) !== String(req.user?._id)
  ) {
    throw new ApiError(404, "Event not found");
  }

    let isRegistered = false;
    let isWaitlisted = false;
    let waitlistPosition = null;

    if (req.user?.role === "student") {

      const registration =
        await EventRegistration.findOne({
          event: event._id,
          student: req.user._id,
          status: "registered"
        });

      isRegistered = !!registration;

      const waitlistEntry =
        await EventRegistration.findOne({
          event: event._id,
          student: req.user._id,
          status: "waitlisted"
        });

      isWaitlisted = !!waitlistEntry;

      if (waitlistEntry) {

        waitlistPosition =
          await EventRegistration.countDocuments({
            event: event._id,
            status: "waitlisted",
            createdAt: {
              $lte: waitlistEntry.createdAt
            }
          });
      }
    }

      res.json({
      ...event.toObject(),
      isRegistered,
      isWaitlisted,
      waitlistPosition
    });
});

export const createEvent = asyncHandler(async (req, res) => {
  let poster = { url: req.body.posterUrl || "", publicId: "" };
      if (req.file) {
    poster = await uploadImageBuffer(req.file.buffer);
  }
  const club = await ClubProfile.findOne({ user: req.user._id });
  if (!club) {
  throw new ApiError(404, "Club profile not found");
}

if (!club.isApproved) {
  throw new ApiError(
    403,
    "Your club must be approved by an admin before creating events"
  );
}
  const deadline = new Date(req.body.deadline);
const eventDate = new Date(req.body.eventDate);

if (eventDate <= new Date()) {
  throw new ApiError(400, "Event date must be in the future");
}

if (deadline <= new Date()) {
  throw new ApiError(400, "Registration deadline must be in the future");
}

if (deadline >= eventDate) {
  throw new ApiError(
    400,
    "Registration deadline must be before the event date"
  );
}
  const event = await Event.create({
    ...req.body,
    tags: Array.isArray(req.body.tags)
  ? req.body.tags
  : JSON.parse(req.body.tags || "[]"),
    poster,
    clubAdmin: req.user._id,
    clubName: club?.clubName
  });
  const matchingStudents =
  await StudentProfile.find({
    interests: {
      $in: event.tags
    }
  });
  console.log("Event Tags:", event.tags);
  console.log(
    "Matching Students:",
    matchingStudents.length
  );

  if (matchingStudents.length) {
    console.log(
      "Creating notifications..."
    );
    const notifications = matchingStudents.map(
      (student) => ({
        user: student.user,
        title: "New Event Match",
        message: `${event.title} matches your interests`,
        type: "event",
        link: `/events/${event._id}`
      })
    );

    await Notification.insertMany(notifications);

    const io = getIO();

    notifications.forEach((notification) => {
      io.to(`user_${notification.user}`).emit(
        "new_notification",
        notification
      );
    });
  }
  res.status(201).json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found");
  ensureOwner(event, req.user);
    if (req.file) {
      await deleteImage(event.poster?.publicId);

      event.poster = await uploadImageBuffer(
        req.file.buffer
      );
    }
      const {
      clubName,
      clubAdmin,
      ...allowedFields
    } = req.body;

  Object.assign(event, allowedFields, {
    tags: req.body.tags
  ? (
      Array.isArray(req.body.tags)
        ? req.body.tags
        : JSON.parse(req.body.tags)
    )
  : event.tags
  });
    if (
    req.body.capacity &&
    Number(req.body.capacity) < event.registrationCount
  ) {
    throw new ApiError(
      400,
      `Capacity cannot be less than current registrations (${event.registrationCount})`
    );
  }
  const deadline = new Date(event.deadline);
  const eventDate = new Date(event.eventDate);


  if (eventDate <= new Date()) {
    throw new ApiError(400, "Event date must be in the future");
  }

  if (deadline <= new Date()) {
    throw new ApiError(400, "Registration deadline must be in the future");
  }

  if (deadline >= eventDate) {
    throw new ApiError(
      400,
      "Registration deadline must be before the event date"
    );
  }

  if (
    event.status === "archived" &&
    deadline > new Date()
  ) {
    event.status = "active";
    event.archiveReason = "";
  }

  await event.save();
  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found");
  ensureOwner(event, req.user);
  event.status = "archived";
  event.archiveReason = "Deleted by owner";
  await event.save();
  res.json({ message: "Event archived" });
});

export const clubStats = asyncHandler(async (req, res) => {
  const filter = req.user.role === "club_admin" ? { clubAdmin: req.user._id } : {};
  const eventIds =
    await Event.find(filter)
      .distinct("_id");
  
  const [
    events,
    active,
    registrations,
    presentCount
  ] = await Promise.all([
    Event.countDocuments(filter),

    Event.countDocuments({
      ...filter,
      status: "active",
      deadline: { $gt: new Date() }
    }),

    EventRegistration.countDocuments({
      status: "registered",
      event: { $in: eventIds }
    }),

    EventRegistration.countDocuments({
      status: "registered",
      attendanceStatus: "present",
      event: { $in: eventIds }
    })
  ]);

  const attendanceRate =
  registrations > 0
    ? (
        (presentCount /
          registrations) *
        100
      ).toFixed(1)
    : 0;
    res.json({
      events,
      active,
      registrations,
      presentCount,
      attendanceRate
    });
});

  export const eventRegistrants = asyncHandler(async (req, res) => {

    const event =
      await Event.findById(req.params.id);

    if (!event)
      throw new ApiError(
        404,
        "Event not found"
      );

    ensureOwner(event, req.user);

    const registrations =
      await EventRegistration.find({
        event: event._id,
        status: "registered"
      }).populate(
        "student",
        "name email"
      );

    res.json(
      registrations.map((registration) => ({
        _id: registration._id,
        attendanceStatus:
          registration.attendanceStatus,
        createdAt:
          registration.createdAt,
        student:
          registration.student
      }))
    );

  });

export const exportRegistrants = asyncHandler(async (req, res) => {

  const event = await Event.findById(req.params.id);

  if (!event)
    throw new ApiError(404, "Event not found");

  ensureOwner(event, req.user);

  const registrations =
    await EventRegistration.find({
      event: event._id,
      status: "registered"
    }).populate(
      "student",
      "name email"
    );

  const presentCount =
    registrations.filter(
      (r) =>
        r.attendanceStatus ===
        "present"
    ).length;

  const absentCount =
    registrations.filter(
      (r) =>
        r.attendanceStatus !==
        "present"
    ).length;

  const attendanceRate =
    registrations.length
      ? (
          (presentCount /
            registrations.length) *
          100
        ).toFixed(1)
      : 0;
  const waitlistedStudents =
    await EventRegistration.find({
      event: event._id,
      status: "waitlisted"
    }).populate(
      "student",
      "name email"
    ).sort({ createdAt: 1 });

  const workbook =
    new ExcelJS.Workbook();

  const worksheet =
    workbook.addWorksheet("Registrants");
  const waitlistWorksheet =
    workbook.addWorksheet("Waitlist");
  

  worksheet.mergeCells("A1:C1");

  worksheet.getCell("A1").value =
    `${event.title} - Registrants Report`;

  worksheet.getCell("A1").font = {
    bold: true,
    size: 16,
    color: { argb: "FF2563EB" }
  };

  worksheet.getCell("A3").value =
    "Club";

  worksheet.getCell("B3").value =
    event.clubName;

  worksheet.getCell("A4").value =
    "Event Date";

  worksheet.getCell("B4").value =
    new Date(
      event.eventDate
    ).toLocaleString();

  worksheet.getCell("A5").value =
    "Total Registrations";

  worksheet.getCell("B5").value =
    registrations.length;

  worksheet.getCell("A6").value =
    "Present Count";

  worksheet.getCell("B6").value =
    presentCount;

  worksheet.getCell("A7").value =
    "Absent Count";

  worksheet.getCell("B7").value =
    absentCount;

  worksheet.getCell("A8").value =
    "Attendance Rate";

  worksheet.getCell("B8").value =
    `${attendanceRate}%`;

  worksheet.getCell("A9").value =
    "Generated At";

  worksheet.getCell("B9").value =
    new Date().toLocaleString();

  ["A3","A4","A5","A6","A7","A8","A9"]
    .forEach((cell) => {
      worksheet.getCell(cell).font = {
        bold: true
      };
    });


  worksheet.columns = [
    {
      key: "name",
      width: 30
    },
    {
      key: "email",
      width: 40
    },
    {
      key: "registeredAt",
      width: 30
    },
    {
      key: "attendance",
      width: 20
    }
  ];

  

  waitlistWorksheet.columns = [
    {
      key: "position",
      width: 15
    },
    {
      key: "name",
      width: 30
    },
    {
      key: "email",
      width: 40
    },
    {
      key: "joinedAt",
      width: 30
    }
  ];

  waitlistWorksheet.mergeCells("A1:D1");

  waitlistWorksheet.getCell("A1").value =
    `${event.title} - Waitlist Report`;

  waitlistWorksheet.getCell("A1").font = {
    bold: true,
    size: 16,
    color: { argb: "FF2563EB" }
  };

  waitlistWorksheet.getCell("A3").value =
    "Club";

  waitlistWorksheet.getCell("B3").value =
    event.clubName;

  waitlistWorksheet.getCell("A4").value =
    "Event Date";

  waitlistWorksheet.getCell("B4").value =
    new Date(event.eventDate)
      .toLocaleString();

  waitlistWorksheet.getCell("A5").value =
    "Total Waitlisted";

  waitlistWorksheet.getCell("B5").value =
    waitlistedStudents.length;

  waitlistWorksheet.getCell("A3").font = {
    bold: true
  };

  waitlistWorksheet.getCell("A4").font = {
    bold: true
  };

  waitlistWorksheet.getCell("A5").font = {
    bold: true
  };
  waitlistWorksheet.addRow([]);
  waitlistWorksheet.addRow([]);

  const waitlistHeaderRow =
    waitlistWorksheet.addRow([
      "Position",
      "Name",
      "Email",
      "Joined Waitlist At"
    ]);

  waitlistHeaderRow.font = {
    bold: true,
    color: { argb: "FFFFFFFF" }
  };

  waitlistHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" }
  };

  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  const headerRow =
    worksheet.addRow([
      "Name",
      "Email",
      "Registered At",
      "Attendance"
    ]);

  headerRow.font = {
    bold: true
  };

  headerRow.font = {
  bold: true,
  color: { argb: "FFFFFFFF" }
};

headerRow.fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF2563EB" }
};

    registrations.forEach((registration) => {
      const row = worksheet.addRow({
        name: registration.student?.name,
        email: registration.student?.email,
        registeredAt:
          new Date(
            registration.createdAt
          ).toLocaleString(),
        attendance:
          registration.attendanceStatus ===
          "present"
            ? "Present"
            : "Absent"
      });

      if (
        registration.attendanceStatus ===
        "present"
      ) {
        row.getCell(4).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "C6EFCE"
          }
        };
      } else {
        row.getCell(4).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FFC7CE"
          }
        };
      }
    });

    waitlistedStudents.forEach(
    (student, index) => {

      waitlistWorksheet.addRow({
        position: index + 1,
        name: student.student?.name,
        email: student.student?.email,
        joinedAt: student.createdAt
      });

    }
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${event.title}-registrants.xlsx`
  );

  await workbook.xlsx.write(res);

  res.end();
});

  export const markAttendance =
    asyncHandler(async (req, res) => {

      const event =
        await Event.findById(
          req.params.eventId
        );

      if (!event) {
        throw new ApiError(
          404,
          "Event not found"
        );
      }

      ensureOwner(event, req.user);

      const registration =
        await EventRegistration.findOneAndUpdate(
          {
            event: req.params.eventId,
            student: req.params.studentId,
            status: "registered"
          },
          {
            attendanceStatus: "present"
          },
          {
            new: true
          }
        );

      if (!registration) {
        throw new ApiError(
          404,
          "Registration not found"
        );
      }

      res.json({
        message:
          "Attendance marked",
        registration
      });

    });


export const eventAnalytics =
  asyncHandler(async (req, res) => {

    const event =
      await Event.findById(req.params.id);

    if (!event) {
      throw new ApiError(
        404,
        "Event not found"
      );
    }

    ensureOwner(event, req.user);

    const registrations =
      await EventRegistration.find({
        event: event._id,
        status: "registered"
      });

    const totalRegistrations =
      registrations.length;

    const presentCount =
      registrations.filter(
        (r) =>
          r.attendanceStatus ===
          "present"
      ).length;

    const absentCount =
      totalRegistrations -
      presentCount;

    const attendanceRate =
      totalRegistrations > 0
        ? (
            (presentCount /
              totalRegistrations) *
            100
          ).toFixed(1)
        : 0;

    res.json({
      totalRegistrations,
      presentCount,
      absentCount,
      attendanceRate
    });

  });
