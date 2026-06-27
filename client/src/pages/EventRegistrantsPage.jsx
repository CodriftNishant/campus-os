import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api.js";
import EmptyState from "../components/EmptyState.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function EventRegistrantsPage() {
  const { id } = useParams();
  const [registrants, setRegistrants] = useState([]);
  const [analytics, setAnalytics] =
  useState(null);
  const chartData = analytics
  ? [
      {
        name: "Present",
        value: analytics.presentCount
      },
      {
        name: "Absent",
        value: analytics.absentCount
      }
    ]
  : [];

  const COLORS = [
    "#16a34a",
    "#dc2626"
  ];

  useEffect(() => {

    api
      .get(`/events/${id}/registrants`)
      .then(({ data }) =>
        setRegistrants(data)
      );

    api
      .get(`/events/${id}/analytics`)
      .then(({ data }) =>
        setAnalytics(data)
      );

  }, [id]);

  const markAttendance = async (studentId) => {
    try {

      await api.patch(
        `/events/${id}/attendance/${studentId}`
      );

      const { data } =
        await api.get(
          `/events/${id}/registrants`
        );

      setRegistrants(data);

    } catch (error) {
      console.error(error);
    }
  };
 return (
  <div className="space-y-4">
    <h1 className="text-2xl font-black">
      Registered students
    </h1>

    {analytics && (
      <div className="grid gap-4 md:grid-cols-4">

        <div className="card p-4">
          <p className="text-sm text-neutral-500">
            Total
          </p>

          <p className="text-3xl font-black">
            {analytics.totalRegistrations}
          </p>
        </div>

        <div className="card p-4 bg-green-50">
          <p className="text-sm text-neutral-500">
            Present
          </p>

          <p className="text-3xl font-black text-green-700">
            {analytics.presentCount}
          </p>
        </div>

        <div className="card p-4 bg-red-50">
          <p className="text-sm text-neutral-500">
            Absent
          </p>

          <p className="text-3xl font-black text-red-700">
            {analytics.absentCount}
          </p>
        </div>

        
          <div
            className={`rounded-lg border border-line shadow-soft p-4 ${
              analytics.attendanceRate >= 70
                ? "bg-green-100"
                : analytics.attendanceRate >= 40
                ? "bg-yellow-100"
                : "bg-red-100"
            }`}
          >

          <p className="text-sm text-neutral-500">
            Attendance %
          </p>

         <p
            className={`text-3xl font-black ${
              analytics.attendanceRate >= 70
                ? "text-green-700"
                : analytics.attendanceRate >= 40
                ? "text-yellow-700"
                : "text-red-700"
            }`}
          >
            {analytics.attendanceRate}%
          </p>
        </div>
      
      </div>

      
      
    )}

    {analytics && (
      <div
        className={`rounded-lg p-4 ${
          analytics.attendanceRate >= 70
            ? "bg-green-100"
            : analytics.attendanceRate >= 40
            ? "bg-yellow-100"
            : "bg-red-100"
        }`}
      >
        <h3 className="font-bold text-lg">
          {analytics.attendanceRate >= 70
            ? "Excellent Attendance"
            : analytics.attendanceRate >= 40
            ? "Moderate Attendance"
            : "Low Attendance"}
        </h3>

        <p className="text-sm mt-1">
          {analytics.attendanceRate >= 70
            ? "Most students attended this event."
            : analytics.attendanceRate >= 40
            ? "Attendance was acceptable but can be improved."
            : "Consider sending reminders before future events."}
        </p>
      </div>
    )}

    {analytics && (
      <div className="card p-6 flex flex-col items-center">
        <h3 className="mb-4 text-lg font-bold self-start">
          Attendance Breakdown
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="value"
              >
                {chartData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[index]
                      }
                    />
                  )
                )}
              </Pie>
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-green-700"
                fontSize="28"
                fontWeight="bold"
              >
                {analytics.attendanceRate}%
              </text>

              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-neutral-500"
                fontSize="14"
              >
                Attendance
              </text>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-600"></div>
            <span className="text-sm">
              Present ({analytics.presentCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-600"></div>
            <span className="text-sm">
              Absent ({analytics.absentCount})
            </span>
          </div>
        </div>
      </div>
    )}

    {registrants.length ? (
      <div className="card divide-y divide-line">
        {registrants.map((item) => (
          <div
            className="flex items-center justify-between p-4"
            key={item._id}
          >
            <div>
              <p className="font-bold">
                {item.student.name}
              </p>

              <p className="text-sm text-neutral-500">
                {item.student.email}
              </p>
            </div>

            <div>
              {item.attendanceStatus ===
              "present" ? (
                <span className="rounded-md bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  Present
                </span>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() =>
                    markAttendance(
                      item.student._id
                    )
                  }
                >
                  Mark Present
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    ) : (
      <EmptyState title="No registrations yet" />
    )}
  </div>
);
}