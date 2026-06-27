import { Notification } from "../models/Notification.js";

export const createNotification = ({ user, title, message, type = "system", link = "" }) =>
  Notification.create({ user, title, message, type, link });
