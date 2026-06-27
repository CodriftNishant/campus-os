import { CalendarCheck, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/api.js";
import StatCard from "../components/StatCard.jsx";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({});
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const load = () => {
    api.get("/admin/analytics").then(({ data }) => setAnalytics(data));
    api.get("/admin/clubs").then(({ data }) => setClubs(data));
    api.get("/admin/events").then(({ data }) => setEvents(data));
  };
  useEffect(load, []);
  const approveClub = async (id, isApproved) => {
    await api.patch(`/admin/clubs/${id}`, { isApproved });
    toast.success("Club status updated");
    load();
  };
    const moderate = async (id, status) => {
    await api.patch(`/admin/events/${id}/moderate`, { status });

    toast.success(
      status === "active"
        ? "Event activated"
        : "Event moderated"
    );

    load();
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Users" value={analytics.users} icon={Users} />
        <StatCard label="Active events" value={analytics.activeEvents} icon={CalendarCheck} />
        <StatCard label="Registrations" value={analytics.registrations} icon={ShieldCheck} />
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-black">Manage clubs</h2>
        <div className="card divide-y divide-line">{clubs.map((club) => <div key={club._id} className="flex items-center justify-between p-4"><div><p className="font-bold">{club.clubName}</p><p className="text-sm text-neutral-500">{club.user?.email}</p></div><button className="btn-secondary" onClick={() => approveClub(club._id, !club.isApproved)}>{club.isApproved ? "Disable" : "Approve"}</button></div>)}</div>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-black">Moderate events</h2>
        <div className="card divide-y divide-line">{events.map((event) => <div key={event._id} className="flex items-center justify-between p-4"><div><p className="font-bold">{event.title}</p><p className="text-sm capitalize text-neutral-500">{event.status}</p></div><div className="flex gap-2"><button className="btn-secondary" onClick={() => moderate(event._id, "active")}>Active</button><button className="btn-secondary" onClick={() => moderate(event._id, "moderated")}>Moderate</button></div></div>)}</div>
      </section>
    </div>
  );
}
