const express = require("express");
const {
  createNotification,
  deleteNotification,
  getAllNotificationByUser,
  getNotificationByID,
  updateNotificationIsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// Route to create a new notification
router.post("/", createNotification);

// Route to get a notification by ID
router.get("/:notificationId", getNotificationByID);

// Route to get all notifications for a user
router.get("/user/:userId", getAllNotificationByUser);

// Route to delete a notification by ID
router.delete("/:notificationId", deleteNotification);

// Route to update the read status of a notification
router.patch("/:notificationId", updateNotificationIsRead);

module.exports = router;
