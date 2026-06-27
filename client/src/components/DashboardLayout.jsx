import { Bell, CalendarDays, Home, LogOut, PlusCircle, Settings, ShieldCheck, User, Users,  ScanLine } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useState,useEffect,useRef } from "react";
import { api } from "../api/api.js";
const links = {
  student: [
    ["Dashboard", "/student", Home],
    ["Registered", "/registered", CalendarDays],
    ["Notifications", "/notifications", Bell],
    ["Verification", "/verification", ShieldCheck],
    ["Profile", "/profile", User],
    ["Settings", "/settings", Settings]
  ],
  club_admin: [
    ["Dashboard", "/club", Home],
    ["Create Event", "/events/new", PlusCircle],
    ["Scan Attendance", "/scan-attendance", ScanLine],
    ["Profile", "/profile", User],
    ["Settings", "/settings", Settings]
  ],
  super_admin: [
    ["Dashboard", "/admin", Home],
    ["Verifications", "/verification", ShieldCheck],
    ["Notifications", "/notifications", Bell],
    ["Settings", "/settings", Settings]
  ]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, loadNotifications} = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const notificationRef = useRef(null);
  useEffect(() => {
    api.get("/notifications")
      .then(({ data }) => {
        setRecentNotifications(
          data.slice(0, 5)
        );
      })
      .catch(() => {});
  }, [unreadCount]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }
  };

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      setShowNotifications(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  document.addEventListener(
    "keydown",
    handleEscape
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );

    document.removeEventListener(
      "keydown",
      handleEscape
    );
  };
}, []);

  const navItems = links[user.role] || [];

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-white p-4 lg:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand text-lg font-black text-white">CE</div>
          <div>
            <p className="font-bold">Campus Events</p>
            <p className="text-xs capitalize text-neutral-500">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map(([label, href, Icon]) => (
            <NavLink key={href} to={href} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-brand text-white" : "text-neutral-700 hover:bg-mist"}`}>
              <>
              <Icon size={18} />
              <span>{label}</span>

              {label === "Notifications" &&
                unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
            </>
            </NavLink>
          ))}
        </nav>
        <button
          className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-mist"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Welcome back</p>
              <h1 className="text-xl font-bold">{user.name}</h1>
            </div>
            <div className="flex items-center gap-4">

              <div className="relative" ref={notificationRef}>
              <button
                onClick={() =>
                  setShowNotifications(prev => !prev)
                }
              >
                <Bell className="text-brand" />
              </button>

              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
              {showNotifications && (
                <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-line bg-white shadow-lg">
                  <div className="border-b border-line p-3">
                    <h3 className="font-bold">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {recentNotifications.length ? (
                      recentNotifications.map((item) => (
                        <div
                          key={item._id}
                          onClick={async () => {
                            try {
                              if (!item.read) {
                                await api.patch(
                                  `/notifications/${item._id}/read`
                                );

                                await loadNotifications();
                              }

                              setShowNotifications(false);

                              if (item.link) {
                                navigate(item.link);
                              }
                            } catch (error) {
                              console.error(error);
                            }
                          }}
                          className={`cursor-pointer border-b border-line p-3 hover:bg-gray-50 ${
                            item.read ? "" : "bg-teal-50"
                          }`}
                        >
                          <p className="text-sm font-bold">
                            {item.title}
                          </p>

                          <p className="text-xs text-neutral-600">
                            {item.message}
                          </p>

                          <p className="text-[11px] text-neutral-400 mt-1">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-neutral-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="border-t border-line p-3">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/notifications");
                      }}
                      className="w-full text-center text-sm font-semibold text-brand hover:underline"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
              <Users className="text-brand" />
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map(([label, href]) => (
              <NavLink key={href} to={href} className="shrink-0 rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold">
                {label}
              </NavLink>
            ))}
          </div>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
