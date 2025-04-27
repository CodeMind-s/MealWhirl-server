/**
 * Notification Controller Module
 *
 * This module provides various functions to manage notifications in the system, including creating, retrieving,
 * updating, and deleting notifications. It also integrates with Kafka for messaging and logging.
 *
 * Functions:
 * - createNotification: Creates a new notification and saves it to the database.
 * - getNotificationByID: Fetches a notification by its ID.
 * - getAllNotificationByUser: Fetches all notifications for a specific user by their ID.
 * - deleteNotification: Deletes a notification by its ID.
 * - updateNotificationIsRead: Updates the read status of a notification.
 *
 * Dependencies:
 * - Notification: Mongoose model for the notification schema.
 * - logger: Utility for logging information and errors.
 * - produceMessage: Kafka service for producing messages to Kafka topics.
 */

const Notification = require("../models/notificationModel");
const logger = require("../utils/logger");
const { produceMessage } = require("../services/kafkaService");
const axios = require("axios"); // Import axios for making HTTP requests
require("dotenv").config();
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.WEB_EMAIL,
    pass: process.env.WEB_EMAI_APP_PASSWORD,
  },
});

/**
 * Creates a new notification and saves it to the database.
 *
 * @async
 * @function createNotification
 * @param {Object} notificationData - The data for the notification to be created.
 * @param {string} notificationData.userId - The ID of the user to notify.
 * @param {string} notificationData.title - The title of the notification.
 * @param {string} notificationData.message - The message content of the notification.
 * @param {string} [notificationData.type] - The type of the notification (e.g., OrderUpdate, Promotion).
 * @returns {Promise<Object>} The saved notification object.
 * @throws {Error} Throws an error if required fields are missing or if any other error occurs during notification creation.
 */
exports.createNotification = async (notificationData) => {
  try {
    logger.info(
      "[NOTIFICATION_SERVICE] {action:createNotification, status:init} Starting notification creation:",
      notificationData
    );

    const { userId, title, message, type } = notificationData;

    if (!userId || !title || !message) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:createNotification, status:failed, reason:validation_error} Missing required fields"
      );
      throw new Error(
        "Missing required fields: userId, title, and message are required"
      );
    }

    // Validate the type field against the allowed enum values
    const allowedTypes = ["OrderUpdate", "Promotion", "General"];
    if (type && !allowedTypes.includes(type)) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:createNotification, status:failed, reason:validation_error} Invalid notification type"
      );
      throw new Error(
        `Invalid notification type. Allowed types are: ${allowedTypes.join(
          ", "
        )}`
      );
    }

    const newNotification = new Notification({ userId, title, message, type });
    const savedNotification = await newNotification.save();

    logger.info(
      "[NOTIFICATION_SERVICE] {action:createNotification, status:success} Notification saved to DB",
      { notificationId: savedNotification._id }
    );

    await produceMessage("notification-topic", {
      notificationId: savedNotification._id,
      userId,
      action: "create",
      timestamp: new Date().toISOString(),
    });

    logger.info(
      "[NOTIFICATION_SERVICE] {action:createNotification, kafka:notification-topic, status:sent} Kafka message sent",
      { notificationId: savedNotification._id }
    );

    return savedNotification;
  } catch (error) {
    logger.error(
      `[NOTIFICATION_SERVICE] {action:createNotification, status:error} ${error.message}`,
      { stack: error.stack }
    );
    throw error;
  }
};

/**
 * Fetches a notification by its ID.
 *
 * @async
 * @function getNotificationByID
 * @param {string} notificationId - The ID of the notification to fetch.
 * @returns {Promise<Object>} The notification object if found.
 * @throws {Error} Throws an error if the notification ID is not provided or if the notification is not found.
 */
exports.getNotificationByID = async (notificationId) => {
  try {
    logger.info(
      `[NOTIFICATION_SERVICE] {action:getNotificationByID, status:init} Fetching notification: ${notificationId}`
    );

    if (!notificationId) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:getNotificationByID, status:failed, reason:validation_error} Notification ID is required"
      );
      throw new Error("Notification ID is required");
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      logger.error(
        `[NOTIFICATION_SERVICE] {action:getNotificationByID, status:failed} Notification not found: ${notificationId}`
      );
      throw new Error("Notification not found");
    }

    logger.info(
      `[NOTIFICATION_SERVICE] {action:getNotificationByID, status:success} Notification fetched successfully: ${notificationId}`
    );
    return notification;
  } catch (error) {
    logger.error(
      `[NOTIFICATION_SERVICE] {action:getNotificationByID, status:error} ${error.message}`,
      { stack: error.stack }
    );
    throw error;
  }
};

/**
 * Fetches all notifications for a specific user by their ID.
 *
 * @async
 * @function getAllNotificationByUser
 * @param {string} userId - The ID of the user whose notifications to fetch.
 * @returns {Promise<Array<Object>>} An array of notification objects for the specified user.
 * @throws {Error} Throws an error if the user ID is not provided or if no notifications are found.
 */
exports.getAllNotificationByUser = async (userId) => {
  try {
    logger.info(
      `[NOTIFICATION_SERVICE] {action:getAllNotificationByUser, status:init} Fetching notifications for user: ${userId}`
    );

    if (!userId) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:getAllNotificationByUser, status:failed, reason:validation_error} User ID is required"
      );
      throw new Error("User ID is required");
    }

    const notifications = await Notification.find({ userId });

    if (!notifications || notifications.length === 0) {
      logger.error(
        `[NOTIFICATION_SERVICE] {action:getAllNotificationByUser, status:failed} Notifications not found for user: ${userId}`
      );
      throw new Error("Notifications not found");
    }

    logger.info(
      `[NOTIFICATION_SERVICE] {action:getAllNotificationByUser, status:success} Notifications fetched successfully for user: ${userId}`
    );
    return notifications;
  } catch (error) {
    logger.error(
      `[NOTIFICATION_SERVICE] {action:getAllNotificationByUser, status:error} ${error.message}`,
      { stack: error.stack }
    );
    throw error;
  }
};

/**
 * Deletes a notification by its ID.
 *
 * @async
 * @function deleteNotification
 * @param {string} notificationId - The ID of the notification to delete.
 * @returns {Promise<Object>} A success message indicating the notification was deleted.
 * @throws {Error} Throws an error if the notification ID is not provided or if the notification is not found.
 */
exports.deleteNotification = async (notificationId) => {
  try {
    logger.info(
      `[NOTIFICATION_SERVICE] {action:deleteNotification, status:init} Deleting notification: ${notificationId}`
    );

    if (!notificationId) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:deleteNotification, status:failed, reason:validation_error} Notification ID is required"
      );
      throw new Error("Notification ID is required");
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      logger.error(
        `[NOTIFICATION_SERVICE] {action:deleteNotification, status:failed} Notification not found: ${notificationId}`
      );
      throw new Error("Notification not found");
    }

    await Notification.findByIdAndDelete(notificationId);

    logger.info(
      `[NOTIFICATION_SERVICE] {action:deleteNotification, status:success} Notification deleted: ${notificationId}`
    );
    return { message: "Notification deleted successfully" };
  } catch (error) {
    logger.error(
      `[NOTIFICATION_SERVICE] {action:deleteNotification, status:error} ${error.message}`,
      { stack: error.stack }
    );
    throw error;
  }
};

/**
 * Updates the read status of a notification.
 *
 * @async
 * @function updateNotificationIsRead
 * @param {string} notificationId - The ID of the notification to update.
 * @param {boolean} isRead - The new read status to set for the notification.
 * @returns {Promise<Object>} The updated notification object.
 * @throws {Error} Throws an error if the notification ID is not provided or if the notification is not found.
 */
exports.updateNotificationIsRead = async (notificationId, isRead) => {
  try {
    logger.info(
      `[NOTIFICATION_SERVICE] {action:updateNotificationIsRead, status:init} Updating read status for notification: ${notificationId}`
    );

    if (!notificationId) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:updateNotificationIsRead, status:failed, reason:validation_error} Notification ID is required"
      );
      throw new Error("Notification ID is required");
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      logger.error(
        `[NOTIFICATION_SERVICE] {action:updateNotificationIsRead, status:failed} Notification not found: ${notificationId}`
      );
      throw new Error("Notification not found");
    }

    notification.isRead = isRead;
    const updatedNotification = await notification.save();

    logger.info(
      `[NOTIFICATION_SERVICE] {action:updateNotificationIsRead, status:success} Read status updated for notification: ${notificationId}`
    );
    return updatedNotification;
  } catch (error) {
    logger.error(
      `[NOTIFICATION_SERVICE] {action:updateNotificationIsRead, status:error} ${error.message}`,
      { stack: error.stack }
    );
    throw error;
  }
};

/**
 * Sends an SMS notification using Notify.lk API.
 *
 * @async
 * @function sendSMSNotification
 * @param {Object} smsData - The data for the SMS to be sent.
 * @param {string} smsData.to - The recipient's phone number in the format 9471XXXXXXX.
 * @param {string} smsData.message - The SMS content (maximum 621 characters).
 * @returns {Promise<Object>} The response from the Notify.lk API.
 * @throws {Error} Throws an error if required fields are missing or if the API call fails.
 */
exports.sendSMSNotification = async (smsData) => {
  try {
    logger.info(
      "[NOTIFICATION_SERVICE] {action:sendSMSNotification, status:init} Sending SMS notification:",
      smsData
    );

    const { to, message } = smsData;

    if (!to || !message) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:sendSMSNotification, status:failed, reason:validation_error} Missing required fields"
      );
      throw new Error(
        "Missing required fields: 'to' and 'message' are required"
      );
    }

    const apiUrl = "https://app.notify.lk/api/v1/send";
    const userId = process.env.YOUR_USER_ID;
    const apiKey = process.env.YOUR_API_KEY;
    const senderId = process.env.SENDER_ID;

    const response = await axios.get(apiUrl, {
      params: {
        user_id: userId,
        api_key: apiKey,
        sender_id: senderId,
        to,
        message,
      },
    });

    logger.info(
      "[NOTIFICATION_SERVICE] {action:sendSMSNotification, status:success} SMS sent successfully",
      response.data
    );
    return response.data;
  } catch (error) {
    logger.error(
      `[NOTIFICATION_SERVICE] {action:sendSMSNotification, status:error} ${error.message}`,
      { stack: error.stack }
    );
    throw error;
  }
};

/**
 * Sends an Email notification using nodemailes.
 *
 * @async
 * @function sendSMSNotification
 * @param {Object} emailData - The data for the email to be sent.
 * @param {string} smsData.to - The recipient's phone number in the format 9471XXXXXXX.
 * @param {string} smsData.message - The SMS content (maximum 621 characters).
 * @returns {Promise<Object>} The response from the Notify.lk API.
 * @throws {Error} Throws an error if required fields are missing or if the API call fails.
 */
exports.sendEmailNotification = async (emailData) => {
  logger.info(
    `[NOTIFICATION_SERVICE] {action:sendEmailNotification, status:error} Sending email to ${emailData.email}`
  );
  try {
    if (!emailData.email) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:sendEmailNotification, status:error} Error sending email: Please fill all required fields."
      );
      throw new Error("Please fill all required fields.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.email)) {
      logger.error(
        "[NOTIFICATION_SERVICE] {action:sendEmailNotification, status:error} Error sending email: Invalid email format."
      );
      throw new Error("Invalid email format.");
    }

    var mailOptions = {
      from: process.env.WEB_EMAIL,
      to: emailData.email,
      subject: "🍽️ MealWhirl - Order Confirmation",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid rgba(52,131,249, 255); background:rgb(218, 231, 244); border-radius: 8px;">
      <div style="text-align: center;">
        <h2 style="color: #1d4dd5;">MealWhirl</h2>
        <p style="font-size: 18px; font-weight: bold;">Your order has been ${emailData.order.status}!</p>
        <p style="color: #555;">Order ID: ${emailData.order._id}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 10px;">
        <p><strong>📦 Order Summary:</strong></p>
        ${emailData.order.items
          .map(
            (item) => `
          <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <p><strong>${item.name}</strong> × ${item.quantity}</p>
            <p>${parseFloat(item.price).toFixed(2)} LKR</p>
          </div>
        `
          )
          .join("")}
        
        <div style="margin-top: 15px;">
          <p><strong>Subtotal:</strong> ${parseFloat(
            emailData.order.subtotal
          ).toFixed(2)} LKR</p>
          <p><strong>Delivery Fee:</strong> ${parseFloat(
            emailData.order.deliveryFee
          ).toFixed(2)} LKR</p>
          <p><strong>Total:</strong> ${parseFloat(
            emailData.order.totalAmount
          ).toFixed(2)} LKR</p>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <p><strong>🚚 Delivery Information:</strong></p>
        <p>${emailData.order.deliveryAddress}</p>
        <p>Estimated delivery time: ${emailData.order.estimatedDelivery}</p>
      </div>
      
      <div style="margin-top: 20px; background: #FFF3CD; padding: 10px; border-radius: 4px;">
        <p><strong>ℹ️ Order Status:</strong> ${emailData.order.status}</p>
        <p>${emailData.order.status.toLowerCase() === "delivered" ? "Your order has been delivered!" : "🎉We'll notify you when your order is on its way!"}</p>
      </div>
      
      <p style="margin-top: 20px;">If you have any questions about your order, reply to this email or contact our support team.</p>
      
      <p style="text-align: center; font-size: 14px; color: #555;">
        Thank you for choosing MealWhirl! We hope you enjoy your meal. 🍕
      </p>
    </div>
        `,
    };

    const res = await transporter.sendMail(mailOptions);
    if (res.accepted.length === 0) {
      logger.error("Error sending email: Failed to send email.");
      return { message: "Email Notification sent fail" }
      throw new Error("Failed to send email.");
    } else {
      logger.info(`Email sent to ${emailData.email}`);
      return { message: "Email Notification sent successfully" }
    }
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw new Error("Failed to send email.");
  }
};
