const mongoose = require("mongoose");
const User = require("./userModel");

const PaymentSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
    },
    cardNumber: {
      type: String,
      trim: true,
      match: [/^\d{16}$/, "Card number must be 16 digits"], // Validation for card number
      required: true,
    },
    cardHolderName: {
      type: String,
      trim: true,
      required: true,
    },
    expiryDate: {
      type: String,
      match: [
        /^(0[1-9]|1[0-2])\/\d{2}$/,
        "Expiry date must be in MM/YY format",
      ], // Validation for expiry date
      required: true,
    },
    cvv: {
      type: String,
      match: [/^\d{3,4}$/, "CVV must be 3 or 4 digits"], // Validation for CVV
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false, // Indicates if this is the default card
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.pre("save", async function (next) {
  try {
    const createdByExists = await User.exists({ identifier: this.createdBy });
    const updatedByExists = await User.exists({ identifier: this.updatedBy });

    if (!createdByExists) {
      return next(
        new Error(
          "The `createdBy` value does not correspond to an existing user identifier."
        )
      );
    }
    if (!updatedByExists) {
      return next(
        new Error(
          "The `updatedBy` value does not correspond to an existing user identifier."
        )
      );
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Payment", PaymentSchema);
