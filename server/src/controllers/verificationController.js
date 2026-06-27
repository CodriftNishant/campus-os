import { VerificationRequest } from "../models/VerificationRequest.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../services/notificationService.js";

export const getMyVerification = asyncHandler(async (req, res) => {
  const request = await VerificationRequest.findOne({ student: req.user._id }).sort({ createdAt: -1 });
  res.json(request);
});

export const requestVerification = asyncHandler(
  async (req, res) => {

    const profile =
      await StudentProfile.findOne({
        user: req.user._id
      });

    let request =
      await VerificationRequest.findOne({
        student: req.user._id
      });

    if (request) {

      request.status = "pending";
      request.note = "";
      request.reviewedBy = null;
      request.reviewedAt = null;

      await request.save();

    } else {

      request =
        await VerificationRequest.create({
          student: req.user._id,
          rollNumber:
            profile.rollNumber,
          department:
            profile.department,
          year: profile.year
        });
    }

    profile.verificationStatus =
      "pending";

    await profile.save();

    res.status(201).json(request);
  }
);

export const listVerificationRequests = asyncHandler(async (_req, res) => {
  const requests = await VerificationRequest.find().populate("student", "name email").sort({ createdAt: -1 });
  res.json(requests);
});

export const reviewVerification = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const request = await VerificationRequest.findByIdAndUpdate(
    req.params.id,
    { status, note: note || "", reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  );
  await StudentProfile.findOneAndUpdate({ user: request.student }, { verificationStatus: status === "approved" ? "verified" : "rejected" });
  await createNotification({
    user: request.student,
    title: status === "approved" ? "Verification approved" : "Verification rejected",
    message: status === "approved" ? "Your roll number has been verified." : note || "Your verification request was rejected.",
    type: "verification",
    link: "/verification"
  });
  res.json(request);
});
