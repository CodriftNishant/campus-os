import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api.js";
import EventForm from "../components/EventForm.jsx";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const currentUser = JSON.parse(
  localStorage.getItem("campus_user") || "null"
);
  useEffect(() => {
  api.get(`/events/${id}`)
    .then(({ data }) => {
      if (
        currentUser?.role === "club_admin" &&
        data.clubAdmin !== currentUser._id
      ) {
        toast.error("You are not allowed to edit this event");
        navigate("/club");
        return;
      }

      setEvent(data);
    })
    .catch(() => {
      toast.error("Event not found");
      navigate("/club");
    });
}, [id, navigate, currentUser]);
  const submit = async (payload) => {
  try {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (key === "tags") {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    await api.put(`/events/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Event updated");
    navigate("/club");
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to update event"
    );
  }
};
  return <div className="space-y-4"><h1 className="text-2xl font-black">Edit event</h1>{event && <EventForm initialEvent={event} onSubmit={submit} />}</div>;
}
