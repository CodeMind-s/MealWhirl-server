const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    itemsByRestaurant: [
      {
        restaurantId: { type: String, required: true },
        items: [
          {
            menuItemId: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: {
              type: Number,
              required: true,
              min: 1,
              default: 1,
            },
            totalItemPrice: { type: Number, required: true },
          },
        ],
        subtotal: { type: Number, required: true, default: 0 },
      },
    ],
    activeRestaurantId: {
      type: String,
      default: null,
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Cart", CartSchema);
