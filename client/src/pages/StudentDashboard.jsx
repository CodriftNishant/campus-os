import { CalendarCheck, Sparkles, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import EventCard from "../components/EventCard.jsx";
import EventFilters from "../components/EventFilters.jsx";
import StatCard from "../components/StatCard.jsx";
import { api } from "../api/api.js";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filters, setFilters] = useState({ search: "", club: "", category: "", interest: "" });
  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get("/events", { params }).then(({ data }) => setEvents(data));
  }, [filters]);
  useEffect(() => {
    api.get("/recommendations/me").then(({ data }) => setRecommendations(
      [...data].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      )
    ));
    api.get("/registrations/me").then(({ data }) => setRegistrations(data));
  }, []);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active events" value={events.length} icon={CalendarCheck} />
        <StatCard label="Registered events" value={registrations.length} icon={Ticket} />
        <StatCard label="Recommendations" value={recommendations.length} icon={Sparkles} />
      </div>
      <section>
  <h2 className="mb-4 text-xl font-black">
    Recommended for You
  </h2>

  {recommendations.length ? (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {recommendations.map((item,index) => (
        <EventCard
          key={item.event._id}
          event={item.event}
          reason={item.reason}
          score={item.score}
          isTopPick={index === 0}
        />
      ))}
    </div>
  ) : (
    <EmptyState
      title="No recommendations yet"
      text="Add interests to your profile to improve matches."
    />
  )}
</section>
      <section className="space-y-4">
        <h2 className="text-xl font-black">Browse Events</h2>
        <EventFilters filters={filters} setFilters={setFilters} />
        {events.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{events.map((event) => <EventCard key={event._id} event={event} />)}</div> : <EmptyState title="No active events found" />}
      </section>
    </div>
  );
}
