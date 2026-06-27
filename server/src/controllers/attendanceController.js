import { EventRegistration } from "../models/EventRegistration.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../socket.js";

export const scanAttendanceQR = asyncHandler(
  async (req, res) => {
    const {
      registrationId,
      eventId,
      studentId
    } = req.body;

    const registration =
      await EventRegistration.findOne({
        _id: registrationId,
        event: eventId,
        student: studentId
      });

    if (!registration) {
      throw new ApiError(
        404,
        "Invalid QR code"
      );
    }

    if (
      registration.attendanceStatus ===
      "present"
    ) {
      throw new ApiError(
        400,
        "Attendance already marked"
      );
    }

    registration.attendanceStatus =
      "present";

    await registration.save();

    const io = getIO();

    io.emit("attendance_update", {
      eventId,
      studentId
    });
    
    res.json({
      success: true,
      message:
        "Attendance marked successfully",
      studentId,
      eventId
    });
  }
);