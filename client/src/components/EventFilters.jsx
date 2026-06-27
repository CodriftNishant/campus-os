import { Search } from "lucide-react";

export default function EventFilters({ filters, setFilters }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  return (
    <div className="card grid gap-3 p-4 md:grid-cols-5">
      <label className="relative md:col-span-2">
        <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
        <input className="input pl-10" placeholder="Search events" value={filters.search} onChange={(e) => update("search", e.target.value)} />
      </label>
      <input className="input" placeholder="Club" value={filters.club} onChange={(e) => update("club", e.target.value)} />
      <input className="input" placeholder="Category" value={filters.category} onChange={(e) => update("category", e.target.value)} />
      <input className="input" placeholder="Interest" value={filters.interest} onChange={(e) => update("interest", e.target.value)} />
    </div>
  );
}
