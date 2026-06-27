import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { api } from "../api/api";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

export default function QRScannerPage() {
  const [searchParams] = useSearchParams();

  const selectedEventId =
    searchParams.get("eventId");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const qrData = JSON.parse(decodedText);

          console.log(
            "Selected Event:",
            selectedEventId
          );

          console.log(
            "QR Event:",
            qrData.eventId
          );

          if (
            selectedEventId &&
            qrData.eventId !== selectedEventId
          ) {
            toast.error(
              "This QR belongs to a different event"
            );
            return;
          }
          const { data } = await api.post(
            "/attendance/scan",
            qrData
          );

          toast.success(data.message);

          scanner.clear();
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "Scan failed"
          );
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-black mb-4">
        Scan Event QR
      </h1>
      <p className="mb-4 text-sm text-neutral-500">
        Event ID: {selectedEventId}
      </p>

      <div id="reader"></div>
    </div>
  );
}