import PDFDocument from "pdfkit";
import { EventRegistration } from "../models/EventRegistration.js";
import { Event } from "../models/Event.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import QRCode from "qrcode";

export const downloadCertificate = asyncHandler(
  async (req, res) => {
    const registration =
      await EventRegistration.findOne({
        event: req.params.eventId,
        student: req.user._id
      })
        .populate("student")
        .populate("event");

    if (!registration) {
      throw new ApiError(
        404,
        "Registration not found"
      );
    }

    if (
      registration.attendanceStatus !==
      "present"
    ) {
      throw new ApiError(
        403,
        "Certificate available only for attendees"
      );
    }

    const verificationUrl =
  `${process.env.CLIENT_URL}/verify-certificate/${registration._id}`;
    const doc = new PDFDocument();
    const qrCodeDataUrl =
      await QRCode.toDataURL(
        verificationUrl
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate.pdf`
    );

    doc.pipe(res);

    doc.rect(
      20,
      20,
      doc.page.width - 40,
      doc.page.height - 40
    ).stroke();

    doc.rect(
      30,
      30,
      doc.page.width - 60,
      doc.page.height - 60
    ).stroke();

    doc.moveDown(1);

    doc
      .fontSize(18)
      .text("CAMPUS EVENTS", {
        align: "center"
      });

    doc.moveDown(0.5);

    doc
      .fontSize(32)
      .text(
        "Certificate of Participation",
        {
          align: "center"
        }
      );
    
    doc.moveDown(0.2);

    doc.moveTo(180, doc.y)
      .lineTo(430, doc.y)
      .stroke();

    doc.moveDown(1);
    
    doc.moveDown(1);
    doc.moveDown();

    doc
    .fontSize(16)
    .text("Presented To", {
      align: "center"
    });

    doc.moveDown();

    doc
      .fontSize(34)
      .text(
        registration.student.name,
        {
          align: "center"
        }
      );

    
    doc.moveDown();

      doc
        .fontSize(16)
        .text(
          "For Successfully Participating In",
          {
            align: "center"
          }
        );

    doc.moveDown();

    doc.fontSize(22).text(
      registration.event.title,
      {
        align: "center"
      }
    );

    doc.moveDown(0.5);

    doc.fontSize(14).text(
      `Organized By ${registration.event.clubName || "Campus Events"}`,
      {
        align: "center"
      }
    );


    doc.moveDown();

    doc.moveDown(2);

    doc.fontSize(14).text(
      `Issued On: ${new Date(
        registration.event.eventDate
      ).toLocaleDateString()}`,
      {
        align: "left"
      }
    );

    doc.moveDown(4);

    doc.moveTo(60, doc.y)
   .lineTo(180, doc.y)
   .stroke();

    doc.text(
      "Club Coordinator",
      60,
      doc.y + 5
    );
    doc.moveDown();

    doc.fontSize(12).text(
      `Certificate No: ${registration._id}`
    );

    doc.moveDown();

    // doc.fontSize(10).text(
    //   `Verify at: ${verificationUrl}`,
    //   50,
    //   doc.page.height - 80,
    //   {
    //     width: 300
    //   }
    // );
    const qrImage = Buffer.from(
      qrCodeDataUrl.replace(
        /^data:image\/png;base64,/,
        ""
      ),
      "base64"
    );

    doc.moveDown();

    doc.image(
      qrImage,
      doc.page.width - 170,
      doc.page.height - 240,
      {
        width: 120
      }
    );
    doc.fontSize(11);

    doc.text(
      "Scan QR To Verify",
      doc.page.width - 180,
      doc.page.height - 115,
      {
        width: 140,
        align: "center"
      }
    );

    // doc.text(
    //   "Scan QR to verify certificate",
    //   doc.page.width - 190,
    //   doc.page.height - 70,
    //   {
    //     width: 170,
    //     align: "center"
    //   }
    // );

    doc.end();
  }

);

export const verifyCertificate =
  asyncHandler(async (req, res) => {

    const registration =
      await EventRegistration.findById(
        req.params.registrationId
      )
        .populate("student")
        .populate("event");

    if (!registration) {
      throw new ApiError(
        404,
        "Certificate not found"
      );
    }

    if (
      registration.attendanceStatus !==
      "present"
    ) {
      throw new ApiError(
        400,
        "Certificate invalid"
      );
    }

    res.json({
      valid: true,
      student:
        registration.student.name,
      event:
        registration.event.title,
      date:
        registration.event.eventDate
    });
  });