import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
  const { user, profile, refreshMe } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    department: profile?.department || "",
    year: profile?.year || 1,
    phoneNumber: profile?.phoneNumber || "",
    interests: profile?.interests?.join(", ") || "",
    bio: profile?.bio || "",
    clubName: profile?.clubName || "",
    category: profile?.category || "",
    description: profile?.description || "",
    contactEmail: profile?.contactEmail || ""
  });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (e) => {
    e.preventDefault();
    const endpoint = user.role === "student" ? "/profiles/student" : "/profiles/club";
    const payload = user.role === "student" ? { ...form, interests: form.interests.split(",").map((item) => item.trim()).filter(Boolean), year: Number(form.year) } : form;
    await api.put(endpoint, payload);
    await refreshMe();
    toast.success("Profile updated");
  };
  return (
    <form onSubmit={submit} className="card grid gap-4 p-5">
      <h1 className="text-2xl font-black">Profile</h1>
      <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Name" />
      {user.role === "student" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" value={profile?.rollNumber || ""} disabled />
          <input className="input" value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="Department" />
          <input className="input" type="number" value={form.year} onChange={(e) => update("year", e.target.value)} placeholder="Year" />
          <input className="input" value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} placeholder="Phone number" />
          <input className="input md:col-span-2" value={form.interests} onChange={(e) => update("interests", e.target.value)} placeholder="Interests" />
          <textarea className="input md:col-span-2" value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Bio" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" value={form.clubName} onChange={(e) => update("clubName", e.target.value)} placeholder="Club name" />
          <input className="input" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Category" />
          <input className="input" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="Contact email" />
          <textarea className="input md:col-span-2" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Description" />
        </div>
      )}
      <button className="btn-primary w-fit">Save profile</button>
    </form>
  );
}
