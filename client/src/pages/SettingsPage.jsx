import { useAuth } from "../context/AuthContext.jsx";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  return (
    <div className="card space-y-4 p-5">
      <h1 className="text-2xl font-black">Settings</h1>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <p><span className="font-bold">Email:</span> {user.email}</p>
        <p><span className="font-bold">Role:</span> {user.role.replace("_", " ")}</p>
        <p><span className="font-bold">Account:</span> {user.isActive ? "Active" : "Disabled"}</p>
        {profile?.verificationStatus && <p><span className="font-bold">Verification:</span> {profile.verificationStatus}</p>}
      </div>
    </div>
  );
}
