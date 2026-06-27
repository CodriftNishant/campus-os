import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import EventForm from "../components/EventForm.jsx";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const submit = async (payload) => {
    setSubmitting(true);
    try {
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (key === "tags") {
          value.forEach((tag) => formData.append("tags", tag));
        } else {
          formData.append(key, value);
        }
      });

      await api.post("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Event created");
      navigate("/club");
    } catch (error) {
      toast.error(error.response?.data?.message || "Event creation failed");
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="space-y-4"><h1 className="text-2xl font-black">Create event</h1><EventForm onSubmit={submit} submitting={submitting} /></div>;
}
