const Order = require("../models/orderModel");
const logger = require("../utils/logger");
const { produceMessage } = require("../services/kafkaService");

/** Creates a new order and saves it to the database.
 * Validates the input data, constructs the order object, and sends a Kafka message for user validation.
 *
 * @async
 * @function createOrder
 * @param {Object} orderData - The data for the order to be created.
 * @param {string} orderData.userId - The ID of the user placing the order.
 * @param {string} orderData.restaurantId - The ID of the restaurant.
 * @param {Array<Object>} orderData.items - The list of items in the order.
 * @param {Object} orderData.deliveryAddress - The delivery address for the order.
 * @param {string} [orderData.paymentMethod] - The payment method used for the order.
 * @param {string} [orderData.paymentStatus] - The payment status of the order.
 * @param {number} orderData.totalAmount - The total amount for the order.
 * @param {number} [orderData.deliveryFee] - The delivery fee for the order.
 * @param {number} orderData.distance - The distance for the delivery.
 * @param {number} orderData.duration - The estimated delivery duration.
 * @param {number} orderData.fare - The fare for the delivery.
 * @param {string} [orderData.specialInstructions] - Any special instructions for the order.
 * @returns {Promise<Object>} The saved order object.
 * @throws {Error} Throws an error if required fields are missing or if any other error occurs during order creation.
 */
exports.createOrder = async (orderData) => {
  try {
    logger.info(
      "[ORDER_SERVICE] {action:createOrder, status:init} Starting order creation:",
      orderData
    );
    const {
      userId,
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
      paymentStatus,
      totalAmount,
      deliveryFee,
      distance,
      duration,
      fare,
      specialInstructions,
    } = orderData;

    if (
      !userId ||
      !restaurantId ||
      !items ||
      !deliveryAddress ||
      !distance ||
      !duration ||
      !fare ||
      !totalAmount
    ) {
      logger.error(
        "[ORDER_SERVICE] {action:createOrder, status:failed, reason:validation_error} Missing required fields, userId, restaurantId, items, deliveryAddress, distance, duration, fare, totalAmount are required"
      );
      throw new Error(
        "Missing required fields, userId, restaurantId, items, deliveryAddress, distance, duration, fare, totalAmount are required"
      );
    }

    // Create a new order
    const newOrder = new Order({
      userId,
      restaurantId,
      items,
      deliveryAddress,
      deliveryPersonId: null, // assigned once accepted
      paymentMethod,
      paymentStatus,
      totalAmount,
      deliveryFee,
      distance,
      duration,
      fare,
      specialInstructions,
      orderStatus: "PLACED",
    });

    const savedOrder = await newOrder.save();
    logger.info(
      `[ORDER_SERVICE] {action:createOrder, status:success} Order saved to DB`,
      {
        orderId: savedOrder._id.toString(),
      }
    );

    // Send message to Kafka for user validation
    await produceMessage("user-order", {
      orderId: savedOrder._id.toString(),
      userId,
      action: "validate",
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `[ORDER_SERVICE] {action:createOrder, kafka:user-order, status:sent} Kafka validation message sent`,
      {
        orderId: savedOrder._id.toString(),
      }
    );
    return savedOrder;
  } catch (error) {
    logger.error(
      `[ORDER_SERVICE] {action:createOrder, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

/**
 * Fetches an order by its ID.
 *
 * @async
 * @function getOrderById
 * @param {string} orderId - The ID of the order to fetch.
 * @returns {Promise<Object>} The order object if found.
 * @throws {Error} Throws an error if the order ID is not provided,
 *                 if the order is not found, or if any other error occurs.
 */
exports.getOrderById = async (orderId) => {
  try {
    logger.info(
      `[ORDER_SERVICE] {action:getOrderById, status:init } Start Fetching order: ${orderId}`
    );
    if (!orderId) {
      logger.error(
        `[ORDER_SERVICE] {action:getOrderById, status:failed, reason:validation_error} Order ID is required`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Order ID is required");
      error.statusCode = 400;
      throw error;
    }

    const order = await Order.findById(orderId);

    if (!order) {
      logger.error(
        `[ORDER_SERVICE] {action:getOrderById, status:failed} Order not found: ${orderId}`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      `[ORDER_SERVICE] {action:getOrderById, status:success} Order fetched successfully: ${orderId}`
    );
    // Send message to Kafka about order retrieval
    return order;
  } catch (error) {
    logger.error(
      `[ORDER_SERVICE] {action:getOrderById, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

exports.getOrdersByUserId = async (userId) => {
  try {
    logger.info(
      `[ORDER_SERVICE] {action:getOrdersByUserId, status:init } Start Fetching orders for user: ${userId}`
    );
    if (!userId) {
      logger.error(
        `[ORDER_SERVICE] {action:getOrdersByUserId, status:failed, reason:validation_error} User ID is required`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("User ID is required");
      error.statusCode = 400;
      throw error;
    }

    const orders = await Order.find({ userId: userId });

    if (!orders) {
      logger.error(
        `[ORDER_SERVICE] {action:getOrdersByUserId, status:failed} Orders not found for user: ${userId}`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Orders not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      `[ORDER_SERVICE] {action:getOrdersByUserId, status:success} Orders fetched successfully for user: ${userId}`
    );
    // Send message to Kafka about order retrieval
    return orders;
  } catch (error) {
    logger.error(
      `[ORDER_SERVICE] {action:getOrdersByUserId, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

exports.getOrdersByRestaurantId = async (restaurantId) => {
  try {
    logger.info(
      `[ORDER_SERVICE] {action:getOrdersByRestaurantId, status:init } Start Fetching orders for restaurant: ${restaurantId}`
    );
    if (!restaurantId) {
      logger.error(
        `[ORDER_SERVICE] {action:getOrdersByRestaurantId, status:failed, reason:validation_error} User ID is required`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Restaurant ID is required");
      error.statusCode = 400;
      throw error;
    }

    const orders = await Order.find({ restaurantId: restaurantId });

    if (!orders) {
      logger.error(
        `[ORDER_SERVICE] {action:getOrdersByRestaurantId, status:failed} Orders not found for restaurant: ${restaurantId}`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Orders not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      `[ORDER_SERVICE] {action:getOrdersByRestaurantId, status:success} Orders fetched successfully for restaurant: ${restaurantId}`
    );
    // Send message to Kafka about order retrieval
    return orders;
  } catch (error) {
    logger.error(
      `[ORDER_SERVICE] {action:getOrdersByRestaurantId, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

exports.getOrdersByDeliveryPersonId = async (deliveryPersonId) => {
  try {
    logger.info(
      `[ORDER_SERVICE] {action:getOrdersByDeliveryPersonId, status:init } Start Fetching orders for delivery person: ${deliveryPersonId}`
    );
    if (!deliveryPersonId) {
      logger.error(
        `[ORDER_SERVICE] {action:getOrdersByDeliveryPersonId, status:failed, reason:validation_error} User ID is required`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Delivery Person ID is required");
      error.statusCode = 400;
      throw error;
    }

    const orders = await Order.find({ deliveryPersonId: deliveryPersonId });

    if (!orders) {
      logger.error(
        `[ORDER_SERVICE] {action:getOrdersByDeliveryPersonId, status:failed} Orders not found for delivery person: ${deliveryPersonId}`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Orders not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      `[ORDER_SERVICE] {action:getOrdersByDeliveryPersonId, status:success} Orders fetched successfully for delivery person: ${deliveryPersonId}`
    );
    // Send message to Kafka about order retrieval
    return orders;
  } catch (error) {
    logger.error(
      `[ORDER_SERVICE] {action:getOrdersByDeliveryPersonId, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

exports.updateOrderStatus = async (orderId, orderStatus) => {
  try {
    logger.info(
      `[ORDER_SERVICE] {action:updateOrderStatus, status:init} Starting status update ${orderId}, newStatus: ${orderStatus}`
    );
    const order = await Order.findById(orderId);

    if (!order) {
      logger.warn(
        `[ORDER_SERVICE] {action:updateOrderStatus, status:failed, reason:order_not_found}`,
        {
          orderId,
        }
      );
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    order.orderStatus = orderStatus;
    order.updatedAt = Date.now();

    const updatedOrder = await order.save();
    logger.info(
      `[ORDER_SERVICE] {action:updateOrderStatus, status:success} Order status updated`,
      {
        orderId,
        updatedStatus: updatedOrder.orderStatus,
      }
    );

    // Send message to Kafka about order status update
    await produceMessage("order-status", {
      orderId,
      userId: order.userId,
      orderStatus,
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `[ORDER_SERVICE] {action:updateOrderStatus, kafka:order-status, status:sent} Kafka message sent`,
      {
        orderId,
        orderStatus,
      }
    );

    return updatedOrder;
  } catch (error) {
    logger.error(
      `[ORDER_SERVICE] {action:updateOrderStatus, status:error} ${error.message}`,
      {
        orderId,
        stack: error.stack,
      }
    );
    throw error;
  }
};

exports.assignDeliveryPerson = async (orderId, deliveryPersonId) => {
  try {
    logger.info(
      `[ORDER_SERVICE] {action:assignDeliveryPerson, status:init} Assigning delivery person ${deliveryPersonId} to order ${orderId}`
    );
    const order = await Order.findById(orderId);

    if (!order) {
      logger.warn(
        `[ORDER_SERVICE] {action:assignDeliveryPerson, status:failed, reason:order_not_found}`,
        {
          orderId,
        }
      );
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    order.deliveryPersonId = deliveryPersonId;
    order.updatedAt = Date.now();

    const updatedOrder = await order.save();
    logger.info(
      `[ORDER_SERVICE] {action:assignDeliveryPerson, status:success} Assigned delivery person ${deliveryPersonId} to order ${orderId}`
    );

    // Send message to Kafka about order status update
    await produceMessage("order-status", {
      orderId,
      userId: order.userId,
      deliveryPersonId,
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `[ORDER_SERVICE] {action:assignDeliveryPerson, kafka:order-status, status:sent} Kafka message sent`,
      {
        orderId,
        deliveryPersonId,
      }
    );

    return updatedOrder;
  } catch (error) {
    logger.error(
      `[ORDER_SERVICE] {action:assignDeliveryPerson, status:error} ${error.message}`,
      {
        orderId,
        stack: error.stack,
      }
    );
    throw error;
  }
};
