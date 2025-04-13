const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    deliveryAddress: {
      type: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      required: true,
    },
    deliveryPersonId: {
      type: String,
      default: null, // assigned once accepted
    },
    orderStatus: {
      type: String,
      enum: [
        "PLACED", // order placed by user
        "ACCEPTED", // restaurant accepted
        "PREPARING", // food is being cooked
        "REDY_FOR_PICKUP", // food ready to be picked by rider
        "PICKED_UP", // rider has picked it up
        "ON_THE_WAY", // rider is on the way
        "DELIVERED", // delivered to user
        "CANCELLED", // cancelled by user/restaurant/admin
      ],
      default: "PLACED",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID", "FAILED"],
      default: "UNPAID",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    specialInstructions: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
