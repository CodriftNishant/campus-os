import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-brand">College club event platform</p>
          <h1 className="text-5xl font-black leading-tight md:text-6xl">Campus Events</h1>
          <p className="mt-5 max-w-xl text-lg text-neutral-600">A role-based event hub for students, club admins, and campus administrators with verification, smart recommendations, and automatic deadline expiry.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup/student" className="btn-primary">Student signup <ArrowRight size={18} /></Link>
            <Link to="/login/student" className="btn-secondary">Student login</Link>
            <Link to="/login/club" className="btn-secondary">Club login</Link>
            <Link to="/login/admin" className="btn-secondary">Admin login</Link>
          </div>
        </div>
        <div className="grid gap-4">
          {[
            [Sparkles, "AI recommendations", "Students see events matched to their interests."],
            [ShieldCheck, "Verified profiles", "Roll-number verification protects registrations."],
            [Users, "Role dashboards", "Separate workflows for students, clubs, and super admins."]
          ].map(([Icon, title, text]) => (
            <div className="card p-6" key={title}>
              <Icon className="text-brand" />
              <h2 className="mt-4 text-xl font-black">{title}</h2>
              <p className="mt-2 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
