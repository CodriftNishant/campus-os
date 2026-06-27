import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api.js";
import { useAuth } from "./AuthContext.jsx";
import toast from "react-hot-toast";
import { socket } from "../socket.js";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      
      setUnreadCount(
        data.filter((n) => !n.read).length
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleNotification = (notification) => {

      setUnreadCount((prev) => prev + 1);

    toast.success(
      `${notification.title}: ${notification.message}`,
      {
        duration: 5000,
      }
    );

      console.log(
        "Realtime notification:",
        notification
      );
    };

    socket.on(
      "new_notification",
      handleNotification
    );

    return () => {
      socket.off(
        "new_notification",
        handleNotification
      );
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        loadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}