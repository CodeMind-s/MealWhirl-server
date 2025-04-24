const mongoose = require("mongoose");

/**
 * Schema for storing payment transaction details in the Payment Service.
 * This microservice is responsible only for managing payment-related logic.
 */
const TransactionSchema = new mongoose.Schema(
  {
    // ID of the user who initiated the transaction (from User Service)
    userId: {
      type: String, // Keep as String to decouple from User Service's DB structure
      required: true,
    },

    // ID of the order this transaction is associated with (from Order Service)
    // orderId: {
    //   type: String, // Again, decoupled from other service's database
    //   required: true,
    // },

    // Amount charged for the order (including delivery, discounts, etc.)
    totalAmount: {
      type: Number,
      required: true,
    },

    // Delivery fee included in total amount
    deliveryFee: {
      type: Number,
      required: true,
    },

    // Chosen payment method
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD"],
      required: true,
    },

    // Status of the payment
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    // Optional payment gateway transaction ID
    paymentGatewayTransactionId: {
      type: String,
      default: "",
    },

    // Additional notes or metadata for logging/debugging
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt and updatedAt auto-managed
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
