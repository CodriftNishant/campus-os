import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function StudentSignupPage() {
  const navigate = useNavigate();
  const { signupStudent } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNumber: "", department: "", year: 1, phoneNumber: "", interests: "" });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await signupStudent({ ...form, year: Number(form.year), interests: form.interests.split(",").map((item) => item.trim()).filter(Boolean) });
      toast.success("Student account created");
      navigate("/student");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-mist p-4">
      <form onSubmit={submit} className="card grid w-full max-w-2xl gap-4 p-6">
        <h1 className="text-2xl font-black">Student signup</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {["name", "email", "password", "rollNumber", "department", "phoneNumber"].map((key) => (
            <input key={key} className="input" required type={key === "password" ? "password" : key === "email" ? "email" : "text"} placeholder={key.replace(/([A-Z])/g, " $1")} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          ))}
          <input className="input" required type="number" min="1" max="6" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <input className="input" placeholder="Interests: AI, design, music" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
        </div>
        <button className="btn-primary">Create account</button>
      </form>
    </main>
  );
}
