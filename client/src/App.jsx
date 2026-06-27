import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ClubDashboard from "./pages/ClubDashboard.jsx";
import ClubSignupPage from "./pages/ClubSignupPage.jsx";
import CreateEventPage from "./pages/CreateEventPage.jsx";
import EditEventPage from "./pages/EditEventPage.jsx";
import EventDetailsPage from "./pages/EventDetailsPage.jsx";
import EventRegistrantsPage from "./pages/EventRegistrantsPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisteredEventsPage from "./pages/RegisteredEventsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentSignupPage from "./pages/StudentSignupPage.jsx";
import VerificationPage from "./pages/VerificationPage.jsx";
import QRScannerPage from "./pages/QRScannerPage.jsx";
import CertificateVerificationPage from "./pages/CertificateVerificationPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/verify-certificate/:registrationId"
        element={
          <CertificateVerificationPage />
        }
      />
      <Route path="/login/:type" element={<LoginPage />} />
      <Route path="/signup/student" element={<StudentSignupPage />} />
      <Route path="/signup/club" element={<ClubSignupPage />} />
      <Route element={<ProtectedRoute roles={["student", "club_admin", "super_admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/registered" element={<RegisteredEventsPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={["club_admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/club" element={<ClubDashboard />} />
          <Route path="/events/new" element={<CreateEventPage />} />
          <Route path="/events/:id/edit" element={<EditEventPage />} />
          <Route path="/events/:id/registrants" element={<EventRegistrantsPage />} />
          <Route path="/scan-attendance" element={<QRScannerPage />} />
          <Route
            path="/scan-attendance"
            element={<QRScannerPage />}
          />
        </Route>
      </Route>
      <Route element={<ProtectedRoute roles={["super_admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
