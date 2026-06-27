import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { startEventExpiryCron } from "./cron/eventExpiryCron.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { setIO } from "./socket.js";
import { startReminderJob } from "./jobs/reminderJob.js";


dotenv.config();


const PORT = process.env.PORT || 5000;


connectDB().then(() => {
  const server = createServer(app);

  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://campus-os-1.onrender.com"
      ],
      credentials: true
    }
  });

  setIO(io);

  io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  socket.on("join", (data) => {

    socket.join(`user_${data.userId}`);
    console.log(
      `User ${data.userId} joined room user_${data.userId}`
    );

    if (data.role === "club_admin") {

      socket.join(
        `club_${data.userId}`
      );

      console.log(
        `Club joined room club_${data.userId}`
      );
    }
  });

  socket.on("join_event", (eventId) => {
    socket.join(`event_${eventId}`);

    console.log(
      `Socket joined event_${eventId}`
    );
  });

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

  server.listen(PORT, () => {
    console.log(
      `API running on port ${PORT}`
    );

    startEventExpiryCron();
    startReminderJob();
  });
});
