import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/api.js";
import { socket } from "../socket.js";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("campus_user") || "null"));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("campus_token")));

  const refreshMe = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    setProfile(data.profile);
    localStorage.setItem("campus_user", JSON.stringify(data.user));
    return data;
  };

  useEffect(() => {
    if (!localStorage.getItem("campus_token")) return;
    refreshMe().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?._id) {

      socket.emit("join", {
        userId: user._id,
        role: user.role
      });

    }
  }, [user]);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("campus_token", data.token);
    localStorage.setItem("campus_user", JSON.stringify(data.user));
    setUser(data.user);
    await refreshMe();
    return data.user;
  };

  const signupStudent = async (payload) => {
    const { data } = await api.post("/auth/student/signup", payload);
    localStorage.setItem("campus_token", data.token);
    localStorage.setItem("campus_user", JSON.stringify(data.user));
    setUser(data.user);
    await refreshMe();
  };

  const signupClub = async (payload) => {
    const { data } = await api.post("/auth/club/signup", payload);
    localStorage.setItem("campus_token", data.token);
    localStorage.setItem("campus_user", JSON.stringify(data.user));
    setUser(data.user);
    await refreshMe();
  };

  const logout = () => {
    localStorage.removeItem("campus_token");
    localStorage.removeItem("campus_user");
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(() => ({ user, profile, loading, login, signupStudent, signupClub, logout, refreshMe }), [user, profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
