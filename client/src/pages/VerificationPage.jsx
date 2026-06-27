import { Check, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/api.js";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/format.js";

export default function VerificationPage() {
  const { user, profile, refreshMe } = useAuth();
  const [request, setRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const load = () => {
    if (user.role === "student") api.get("/verification/me").then(({ data }) => setRequest(data));
    if (user.role === "super_admin") api.get("/verification/requests").then(({ data }) => setRequests(data));
  };
  useEffect(load, [user.role]);
  const submitRequest = async () => {
    await api.post("/verification/request");
    await refreshMe();
    toast.success("Verification requested");
    load();
  };
  const review = async (id, status) => {
    await api.patch(`/verification/requests/${id}`, { status });
    toast.success("Verification updated");
    load();
  };
  if (user.role === "student") {
    return (
      <div className="card space-y-4 p-5">
        <h1 className="text-2xl font-black">Verification</h1>
        <p className="text-neutral-600">Roll number: <span className="font-bold text-ink">{profile?.rollNumber}</span></p>
        <p className="text-neutral-600">Status: <span className="font-bold capitalize text-ink">{profile?.verificationStatus}</span></p>
        {request && <p className="text-sm text-neutral-500">Last requested on {formatDate(request.createdAt)}</p>}
        {profile?.verificationStatus !== "verified" && <button className="btn-primary w-fit" onClick={submitRequest}><Send size={18} /> Request verification</button>}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Student verification</h1>
      {requests.length ? <div className="card divide-y divide-line">{requests.map((item) => (
        <div key={item._id} className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
          <div>
            <p className="font-bold">{item.student?.name} <span className="text-sm font-normal text-neutral-500">{item.student?.email}</span></p>
            <p className="text-sm text-neutral-600">{item.rollNumber} • {item.department} • Year {item.year}</p>
            <p className="text-xs capitalize text-neutral-500">{item.status}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary px-3" onClick={() => review(item._id, "approved")}><Check size={16} /></button>
            <button className="btn-secondary px-3" onClick={() => review(item._id, "rejected")}><X size={16} /></button>
          </div>
        </div>
      ))}</div> : <EmptyState title="No verification requests" />}
    </div>
  );
}
