import { Router } from "express";
import { sendEmail } from "../services/emailService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Campus Event Platform Test",
      html: `
        <h1>Email Working </h1>
        <p>Nodemailer configured successfully.</p>
      `
    });

    res.json({
      success: true,
      message: "Email sent"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;