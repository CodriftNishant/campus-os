import { LogIn } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const roleMap = { student: "student", club: "club_admin", admin: "super_admin" };
const destination = { student: "/student", club_admin: "/club", super_admin: "/admin" };

export default function LoginPage() {
  const { type = "student" } = useParams();
  const role = roleMap[type] || "student";
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ ...form, role });
      toast.success("Logged in");
      navigate(destination[user.role]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-mist p-4">
      <form onSubmit={submit} className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-black capitalize">{type} login</h1>
        <div className="mt-6 space-y-4">
          <input className="input" type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary w-full" disabled={loading}><LogIn size={18} /> Login</button>
        </div>
          {role !== "super_admin" && (
          <p className="mt-4 text-sm text-neutral-500">
          New here?{" "}
          <Link
          className="font-bold text-brand"
          to={role === "club_admin" ? "/signup/club" : "/signup/student"}
          >
          Create account
          </Link>
          </p>
          )}
      </form>
    </main>
  );
}
