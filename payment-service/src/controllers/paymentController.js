/**
 * Transaction Controller Module
 * 
 * This module provides various functions to manage transactions in the system, including creating, retrieving, updating, 
 * and deleting transactions. It also integrates with Kafka for messaging and logging.
 * 
 * Functions:
 * - createTransaction: Creates a new transaction and saves it to the database.
 * - getAllTransactions: Fetches all transactions from the database.
 * - getTransactionById: Fetches a transaction by its ID.
 * - getTransactionsByUserId: Fetches all transactions for a specific user by their ID.
 * - updateTransactionStatus: Updates the status of a transaction.
 * - deleteTransaction: Deletes a transaction by its ID.
 * 
 * Dependencies:
 * - Transaction: Mongoose model for the transaction schema.
 * - logger: Utility for logging information and errors.
 * - produceMessage: Kafka service for producing messages to Kafka topics.
 * 
 * Error Handling:
 * - Each function validates input parameters and throws appropriate errors if validation fails.
 * - Errors are logged with detailed information, including stack traces.
 * 
 * Kafka Integration:
 * - Kafka messages are sent for actions like transaction creation, status updates, and deletions.
 * - Topics used include "user-transaction" and "transaction-status".
 * 
 * Logging:
 * - Logs are generated for each action, including initialization, success, and error states.
 * - Logs include contextual information such as transaction IDs, user IDs, and error details.
 */
const Transaction = require("../models/transactionModel");
const logger = require("../utils/logger");
const { produceMessage } = require("../services/kafkaService");

/**  
 * Creates a new transaction and saves it to the database.
 * Validates the input data, constructs the transaction object, and logs the process.
 *
 * @async
 * @function createTransaction
 * @param {Object} transactionData - The data for the transaction to be created.
 * @param {string} transactionData.userId - The ID of the user initiating the transaction.
 * @param {number} transactionData.totalAmount - The total amount for the transaction.
 * @param {number} transactionData.deliveryFee - The delivery fee associated with the transaction.
 * @param {string} transactionData.paymentMethod - The payment method used for the transaction.
 * @param {string} transactionData.paymentStatus - The status of the payment (e.g., "completed", "pending").
 * @param {string} transactionData.paymentGatewayTransactionId - The ID of the transaction in the payment gateway.
 * @param {string} transactionData.description - A description or note for the transaction.
 * @returns {Promise<Object>} The saved transaction object.
 * @throws {Error} Throws an error if required fields are missing or if any other error occurs during transaction creation.
 */
exports.createTransaction = async (transactionData) => {
  try {
    logger.info(
      "[PAYMENT_SERVICE] {action:createTransaction, status:init} Starting transaction creation:",
      transactionData
    );
    const {
      userId,
      // orderId,
      totalAmount,
      deliveryFee,
      paymentMethod,
      paymentStatus,
      paymentGatewayTransactionId,
      description,
    } = transactionData;

    if (
      !userId ||
      // !orderId ||
      !totalAmount ||
      !deliveryFee ||
      !paymentMethod ||
      !paymentStatus ||
      !paymentGatewayTransactionId ||
      !description
    ) {
      logger.error(
        "[PAYMENT_SERVICE] {action:createTransaction, status:failed, reason:validation_error} Missing required fields, userId, restaurantId, items, deliveryAddress, distance, duration, fare, totalAmount are required"
      );
      throw new Error(
        "Missing required fields, userId, restaurantId, items, deliveryAddress, distance, duration, fare, totalAmount are required"
      );
    }

    // Create a new transaction
    const newTransaction = new Transaction({
      userId,
      // orderId,
      totalAmount,
      deliveryFee,
      paymentMethod,
      paymentStatus,
      paymentGatewayTransactionId,
      description,
    });

    const savedTransaction = await newTransaction.save();
    logger.info(`[PAYMENT_SERVICE] {action:createTransaction, status:success} transaction created successfully with ID: ${savedTransaction._id}`);

    // Send message to Kafka for user validation
    // await produceMessage("user-order", {
    //   transactionId: savedOrder._id.toString(),
    //   userId,
    //   action: "validate",
    //   timestamp: new Date().toISOString(),
    // });

    // logger.info(
    //   `[PAYMENT_SERVICE] {action:createTransaction, kafka:user-transaction, status:sent} Kafka validation message sent. Transaction ID : ${savedTransaction._id}`
    // );
    return savedTransaction;
  } catch (error) {
    logger.error(
      `[PAYMENT_SERVICE] {action:createTransaction, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

/**
 * Fetches all transactions from the database.
 *
 * @async
 * @function getAllTransactions
 * @returns {Promise<Array<Object>>} An array of all transactin objects.
 * @throws {Error} Throws an error if no transactions are found or if any other error occurs during the operation.
 */
exports.getAllTransactions = async () => {
  try {
    logger.info(
      `[PAYMENT_SERVICE] {action:getAllTransactions, status:init } Start Fetching all transactions`
    );
    // if (!orderId) {
    //   logger.error(
    //     `[ORDER_SERVICE] {action:getOrderById, status:failed, reason:validation_error} Order ID is required`
    //   );
      // Log the error and throw a custom error with status code
    //   const error = new Error("Order ID is required");
    //   error.statusCode = 400;
    //   throw error;
    // }

    const transactions = await Transaction.find({});

    if (!transactions || transactions.length === 0) {
      logger.error(
        `[PAYMENT_SERVICE] {action:getAllTransactions, status:failed} TRANSACTIONS not found`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("transactions not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      `[PAYMENT_SERVICE] {action:getAllTransactions, status:success} Transactions fetched successfully`
    );
    // Send message to Kafka about order retrieval
    return transactions;
  } catch (error) {
    logger.error(
      `[PAYMENT_SERVICE] {action:getAllTransactions, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

/**
 * Fetches an transaction by its ID.
 *
 * @async
 * @function getTransactionById
 * @param {string} transactionId - The ID of the transaction to fetch.
 * @returns {Promise<Object>} The transaction object if found.
 * @throws {Error} Throws an error if the transaction ID is not provided,
 *                 if the transaction is not found, or if any other error occurs.
 */
exports.getTransactionById = async (transactionId) => {
  try {
    logger.info(
      `[PAYMENT_SERVICE] {action:getTransactionById, status:init } Start Fetching Transaction: ${transactionId}`
    );
    if (!transactionId) {
      logger.error(
        `[PAYMENT_SERVICE] {action:getTransactionById, status:failed, reason:validation_error} Transaction ID is required`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Transaction ID is required");
      error.statusCode = 400;
      throw error;
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      logger.error(
        `[PAYMENT_SERVICE] {action:getTransactionById, status:failed} Transaction not found: ${transactionId}`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      `[PAYMENT_SERVICE] {action:getTransactionById, status:success} Transaction fetched successfully: ${transactionId}`
    );
    // Send message to Kafka about order retrieval
    return transaction;
  } catch (error) {
    logger.error(
      `[PAYMENT_SERVICE] {action:getTransactionById, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

/**
 * Fetches all transaction for a specific user by their ID.
 * 
 * @async
 * @function getTransactionsByUserId
 * @param {string} userId - The ID of the user whose transactions to fetch.
 * @returns {Promise<Array<Object>>} An array of transaction objects for the specified user.
 * @throws {Error} Throws an error if the user ID is not provided,  
 *                if no Transactions are found for the user, or if any other error occurs during the operation.
 */
exports.getTransactionsByUserId = async (userId) => {
  try {
    logger.info(
      `[PAYMENT_SERVICE] {action:getTransactionsByUserId, status:init } Start Fetching Transactions for user: ${userId}`
    );
    if (!userId) {
      logger.error(
        `[PAYMENT_SERVICE] {action:getTransactionsByUserId, status:failed, reason:validation_error} User ID is required`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("User ID is required");
      error.statusCode = 400;
      throw error;
    }

    const transactions = await Transaction.find({ userId: userId });

    if (!transactions || transactions.length === 0) {
      logger.error(
        `[PAYMENT_SERVICE] {action:getTransactionsByUserId, status:failed} Transactions not found for user: ${userId}`
      );
      // Log the error and throw a custom error with status code
      const error = new Error("Transactions not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      `[PAYMENT_SERVICE] {action:getTransactionsByUserId, status:success} Transactions fetched successfully for user: ${userId}`
    );
    // Send message to Kafka about transaction retrieval
    return transactions;
  } catch (error) {
    logger.error(
      `[PAYMENT_SERVICE] {action:getTransactionsByUserId, status:error} ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw error;
  }
};

/**
 * Updates the status of an transaction.
 * 
 * This function retrieves an transaction by its ID, updates its status, and saves the changes to the database.
 * It also sends a Kafka message to notify about the status update.
 * 
 * @async
 * @function updateTransactionStatus
 * @param {string} transactionId - The ID of the transaction to update.
 * @param {string} transactionStatus - The new status to set for the transaction.
 * @returns {Promise<Object>} The updated transaction object.
 * @throws {Error} Throws an error if the transaction ID is not provided, 
 *                 if the transaction is not found, or if any other error occurs during the operation.
 */
exports.updateTransactionStatus = async (transactionId, transactionStatus) => {
  try {
    logger.info(
      `[PAYMENT_SERVICE] {action:updateTransactionStatus, status:init} Starting status update ${transactionId}, newStatus: ${transactionStatus}`
    );
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      logger.warn(
        `[PAYMENT_SERVICE] {action:updateTransactionStatus, status:failed, reason:transaction_not_found} for transactionId: ${transactionId}`,
      );
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }

    transaction.paymentStatus = transactionStatus;
    transaction.updatedAt = Date.now();

    const updatedTransaction = await transaction.save();
    logger.info(
      `[PAYMENT_SERVICE] {action:updateTransactionStatus, status:success} Transaction status updated successfully: ${updatedTransaction._id}, newStatus: ${updatedTransaction.paymentStatus}`
    );

    // Send message to Kafka about transaction status update
    // await produceMessage("transaction-status", {
    //   transactionId,
    //   userId: transaction.userId,
    //   transactionStatus,
    //   timestamp: new Date().toISOString(),
    // });

    logger.info(
      `[PAYMENT_SERVICE] {action:updateTransactionStatus, kafka:transaction-status, status:sent} Kafka message sent`,
      {
        transactionId,
        transactionStatus,
      }
    );

    return updatedTransaction;
  } catch (error) {
    logger.error(
      `[PAYMENT_SERVICE] {action:updateTransactionStatus, status:error} ${error.message}`,
      {
        transactionId,
        stack: error.stack,
      }
    );
    throw error;
  }
};

/**
 * Deletes an transaction by its ID.
 * 
 * This function retrieves an transaction by its ID, deletes it from the database, and sends a Kafka message to notify about the deletion.
 * 
 * @async
 * @function deleteTransaction
 * @param {string} transactionId - The ID of the transaction to delete.
 * @returns {Promise<Object>} A success message indicating the transaction was deleted.
 * @throws {Error} Throws an error if the transaction ID is not provided, 
 *                 if the transaction is not found, or if any other error occurs during the operation.
 */
exports.deleteTransaction = async (transactionId) => {
 try {
    logger.info(
      `[PAYMENT_SERVICE] {action:deleteTransaction, status:init} Deleting transaction ${transactionId}`
    );
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      logger.warn(
        `[PAYMENT_SERVICE] {action:deleteTransaction, status:failed, reason:transaction_not_found} Transaction not found: ${transactionId}`
      );
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }

    await Transaction.findByIdAndDelete(transactionId);

    logger.info(
      `[PAYMENT_SERVICE] {action:deleteTransaction, status:success} Deleted transaction ${transactionId}`
    );

    // Send message to Kafka about transaction deletion
    // await produceMessage("transaction-status", {
    //   orderId,
    //   userId: transaction.userId,
    //   action: "delete",
    //   timestamp: new Date().toISOString(),
    // });

    logger.info(
      `[PAYMENT_SERVICE] {action:deleteTransaction, kafka:transaction-status, status:sent} Kafka message sent for transaction deletion id: ${transactionId}`
    );

    return { message: "Transaction deleted successfully" };
  }
  catch (error) {
    logger.error(
      `[PAYMENT_SERVICE] {action:deleteTransaction, status:error} ${error.message}`,
      {
        transactionId,
        stack: error.stack,
      }
    );
    throw error;
  }
}
