import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api.js";

export default function CertificateVerificationPage() {
  const { registrationId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    api
      .get(
        `/certificates/verify/${registrationId}`
      )
      .then(({ data }) => {
        setData(data);
      })
      .catch(() => {
        setError(
          "Certificate not found"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [registrationId]);

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <div className="rounded-xl border p-6 shadow">
        <h1 className="text-3xl font-black text-green-600">
          Certificate Verified ✅
        </h1>

        <div className="mt-6 space-y-3">
          <p>
            <b>Student:</b>{" "}
            {data.student}
          </p>

          <p>
            <b>Event:</b>{" "}
            {data.event}
          </p>

          <p>
            <b>Date:</b>{" "}
            {new Date(
              data.date
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}