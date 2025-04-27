const express = require("express");
const logger = require("../utils/logger");
const router = express.Router();
const { sendMessageWithResponse } = require("../services/kafkaService");

/**
 * @route POST /api/v1/notifications
 * @desc Create a new notification
 * @access Public
 */
router.post("/", async (req, res) => {
  logger.info(
    `{POST /api/v1/notifications} Received request to create notification for userId: ${req.body.userId}`
  );
  try {
    const notificationResult = await sendMessageWithResponse(
      "notification-request",
      {
        action: "createNotification",
        payload: req.body,
      }
    );

    logger.info(
      `{POST /api/v1/notifications} Notification created successfully for userId: ${
        req.body.userId
      }, notificationId: ${notificationResult.notificationId || "N/A"}`
    );
    return res.status(201).json(notificationResult);
  } catch (error) {
    logger.error(
      `{POST /api/v1/notifications} Error creating notification for userId: ${req.body.userId} - ${error.message}`
    );
    return res.status(500).json({
      message: error.message || "Error creating notification",
    });
  }
});

/**
 * @route GET /api/v1/notifications/user/:id
 * @desc Get all notifications for a specific user
 * @access Public
 */
router.get("/user/:id", async (req, res) => {
  logger.info(
    `{GET /api/v1/notifications/user/:id} Received request to get all notifications for userId: ${req.params.id}`
  );
  try {
    const notificationResult = await sendMessageWithResponse(
      "notification-request",
      {
        action: "getAllNotificationByUser",
        payload: { userId: req.params.id },
      }
    );

    if (!notificationResult || notificationResult.length === 0) {
      logger.warn(
        `{GET /api/v1/notifications/user/:id} No notifications found for userId: ${req.params.id}`
      );
      return res.status(404).json({ message: "No notifications found" });
    }

    logger.info(
      `{GET /api/v1/notifications/user/:id} Notifications fetched successfully for userId: ${req.params.id}`
    );
    return res.status(200).json(notificationResult);
  } catch (error) {
    logger.error(
      `{GET /api/v1/notifications/user/:id} Error fetching notifications for userId: ${req.params.id} - ${error.message}`
    );
    return res.status(500).json({
      message: error.message || "Error fetching notifications",
    });
  }
});

/**
 * @route DELETE /api/v1/notifications/:id
 * @desc Delete a notification by ID
 * @access Public
 */
router.delete("/:id", async (req, res) => {
  logger.info(
    `{DELETE /api/v1/notifications/:id} Received request to delete notification with ID: ${req.params.id}`
  );
  try {
    const notificationResult = await sendMessageWithResponse(
      "notification-request",
      {
        action: "deleteNotification",
        payload: { notificationId: req.params.id },
      }
    );

    if (!notificationResult) {
      logger.warn(
        `{DELETE /api/v1/notifications/:id} Notification not found: ${req.params.id}`
      );
      return res.status(404).json({ message: "Notification not found" });
    }

    logger.info(
      `{DELETE /api/v1/notifications/:id} Notification deleted successfully: ${req.params.id}`
    );
    return res.status(200).json(notificationResult);
  } catch (error) {
    logger.error(
      `{DELETE /api/v1/notifications/:id} Error deleting notification with ID: ${req.params.id} - ${error.message}`
    );
    return res.status(500).json({
      message: error.message || "Error deleting notification",
    });
  }
});

/**
 * @route PATCH /api/v1/notifications/:id
 * @desc Update notification read status by ID
 * @access Public
 */
router.patch("/:id", async (req, res) => {
  logger.info(
    `{PATCH /api/v1/notifications/:id} Received request to update read status for notification ID: ${req.params.id}`
  );
  try {
    const notificationResult = await sendMessageWithResponse(
      "notification-request",
      {
        action: "updateNotificationIsRead",
        payload: { notificationId: req.params.id, isRead: req.body.isRead },
      }
    );

    if (!notificationResult) {
      logger.warn(
        `{PATCH /api/v1/notifications/:id} Notification not found: ${req.params.id}`
      );
      return res.status(404).json({ message: "Notification not found" });
    }

    logger.info(
      `{PATCH /api/v1/notifications/:id} Notification read status updated successfully: ${req.params.id}`
    );
    return res.status(200).json(notificationResult);
  } catch (error) {
    logger.error(
      `{PATCH /api/v1/notifications/:id} Error updating read status for notification ID: ${req.params.id} - ${error.message}`
    );
    return res.status(500).json({
      message: error.message || "Error updating notification read status",
    });
  }
});

/**
 * @route POST /api/v1/notifications/sms
 * @desc Send an SMS notification
 * @access Public
 */
router.post("/sms", async (req, res) => {
  logger.info(
    `{POST /api/v1/notifications/sms} Received request to send SMS notification`
  );
  try {
    const smsResult = await sendMessageWithResponse("notification-request", {
      action: "sendSMSNotification",
      payload: req.body,
    });

    logger.info(
      `{POST /api/v1/notifications/sms} SMS notification sent successfully`
    );
    return res.status(200).json(smsResult);
  } catch (error) {
    logger.error(
      `{POST /api/v1/notifications/sms} Error sending SMS notification - ${error.message}`
    );
    return res.status(500).json({
      message: error.message || "Error sending SMS notification",
    });
  }
});

/**
 * @route POST /api/v1/notifications/email
 * @desc Send an Email notification
 * @access Public
 */
router.post("/email", async (req, res) => {
  logger.info(
    `{POST /api/v1/notifications/email} Received request to send Email notification`
  );
  try {
    const emailResult = await sendMessageWithResponse("notification-request", {
      action: "sendEmailNotification",
      payload: req.body,
    });

    logger.info(
      `{POST /api/v1/notifications/email} Email notification sent successfully`
    );
    return res.status(200).json(emailResult);
  } catch (error) {
    logger.error(
      `{POST /api/v1/notifications/email} Error sending Email notification - ${error.message}`
    );
    return res.status(500).json({
      message: error.message || "Error sending SMS notification",
    });
  }
});

/**
 * @route GET /api/v1/notifications/:id
 * @desc Get notification by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    logger.info(`{GET api/v1/notifications/:id} Received request to fetch notification with ID: ${req.params.id}`);
    const notificationResult = await sendMessageWithResponse('notification-request', {
      action: 'getNotificationByID',
      payload: { id: req.params.id }
    });
    
    if (!notificationResult) {
      logger.warn(`{GET api/v1/notifications/:id} notification not found: ${req.params.id}`);
      return res.status(404).json({ message: 'notification not found' });
    }

    logger.info(`{GET api/v1/notifications/:id} notification fetched successfully: ${req.params.id}`);
    return res.status(200).json(notificationResult);
  } catch (error) {
    logger.error(`{GET api/v1/notifications/:id} Error fetching notification with ID: ${req.params.id} - ${error.message}`);
    // Handle specific error types if needed
    return res.status(error.statusCode || 500).json({ 
      message: error.message || 'Error fetching notification' 
    });
  }
});

module.exports = router;
