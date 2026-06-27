import { CalendarDays, MapPin, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/format.js";
import { api } from "../api/api.js";

export default function EventCard({ event, reason, score, isTopPick , qrCode, attendanceStatus}) {
  const downloadCertificate = async (e) => {
    e.preventDefault();

    try {
      const response = await api.get(
        `/certificates/${event._id}`,
        {
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        `${event.title}-certificate.pdf`
      );

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Unable to download certificate"
      );
    }
  };
  return (
    <Link to={`/events/${event._id}`} className="card block overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-36 bg-neutral-200">
        {isTopPick && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow-md">
            ⭐ Top Pick
          </div>
        )}
        {event.poster?.url ? <img src={event.poster.url} alt={event.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-teal-700 to-coral text-2xl font-black text-white">{event.clubName?.slice(0, 2).toUpperCase()}</div>}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{event.clubName}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-black">{event.title}</h3>
        </div>
        <p className="line-clamp-2 text-sm text-neutral-600">{event.description}</p>
        <div className="space-y-2 text-sm text-neutral-600">
          <p className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(event.eventDate)}</p>
          <p className="flex items-center gap-2"><MapPin size={16} /> {event.venue}</p>
          <p className="flex items-center gap-2"><Tag size={16} /> {event.category}</p>
        </div>
        {reason && (
          <div className="rounded-md bg-teal-50 p-2 text-xs font-medium text-teal-900">
            {score !== undefined && (
              <p className="mb-1 font-bold">
                ⭐ AI Match: {score}%
              </p>
            )}
              {score >= 90 && (
                <p className="text-green-700 font-semibold">
                  Excellent Match
                </p>
              )}

              {score >= 75 && score < 90 && (
                <p className="text-blue-700 font-semibold">
                  Strong Match
                </p>
              )}

              {score >= 60 && score < 75 && (
                <p className="text-yellow-700 font-semibold">
                  Good Match
                </p>
              )}
            <p>{reason}</p>
            {event.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {event.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-2 py-1 text-[10px] font-medium border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {qrCode && (
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-sm font-semibold">
              Event Entry QR
            </p>

            <img
              src={qrCode}
              alt="Event QR Code"
              className="mx-auto h-40 w-40 rounded-lg border bg-white p-2"
            />
          </div>
        )}
        {attendanceStatus === "present" && (
          <button
            onClick={downloadCertificate}
            className="mt-3 w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            Download Certificate
          </button>
        )}
      </div>
    </Link>
  );
}
