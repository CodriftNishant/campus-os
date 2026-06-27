import { useEffect, useState } from "react";
import { api } from "../api/api.js";
import EmptyState from "../components/EmptyState.jsx";
import EventCard from "../components/EventCard.jsx";

export default function RegisteredEventsPage() {
  const [registrations, setRegistrations] = useState([]);
  useEffect(() => {
    api.get("/registrations/me").then(({ data }) => {
      console.log("REGISTRATIONS:", data);
      setRegistrations(data);
    });
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Registered events</h1>
      {registrations.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{registrations.map((item) => <EventCard key={item._id} event={item.event}  qrCode={item.qrCode} attendanceStatus={item.attendanceStatus} />)}</div> : <EmptyState title="No registered events" />}
    </div>
  );
}
