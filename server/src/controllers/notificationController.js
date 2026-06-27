import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  res.json(notification);
});

export const markAllNotificationsRead =
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      {
        user: req.user._id,
        read: false
      },
      {
        read: true
      }
    );

    res.json({
      message: "All notifications marked as read"
    });
  });
