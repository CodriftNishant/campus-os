import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ClubSignupPage() {
  const navigate = useNavigate();
  const { signupClub } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", clubName: "", category: "", contactEmail: "", description: "" });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await signupClub(form);
      toast.success("Club account created");
      navigate("/club");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-mist p-4">
      <form onSubmit={submit} className="card grid w-full max-w-2xl gap-4 p-6">
        <h1 className="text-2xl font-black">Club admin signup</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {["name", "email", "password", "clubName", "category", "contactEmail"].map((key) => (
            <input key={key} className="input" required type={key === "password" ? "password" : key.includes("email") || key.includes("Email") ? "email" : "text"} placeholder={key.replace(/([A-Z])/g, " $1")} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          ))}
        </div>
        <textarea className="input min-h-24" placeholder="Club description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-primary">Create club account</button>
      </form>
    </main>
  );
}
