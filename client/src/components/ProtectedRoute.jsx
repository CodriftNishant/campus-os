import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-sm text-neutral-500">Loading session...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
