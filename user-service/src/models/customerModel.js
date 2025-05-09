const mongoose = require("mongoose");
const {
  USER_ACCOUNT_STATUS,
  USER_IDENTIFIER_TYPES,
} = require("../constants/userConstants");
const User = require("./userModel");

const CustomerSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      unique: true, // Primary key for the customer
      required: true,
    },
    accountStatus: {
      type: String,
      enum: Object.values(USER_ACCOUNT_STATUS),
      default: USER_ACCOUNT_STATUS.INACTIVE,
    },
    name: {
      type: String,
      trim: true,
    },
    [USER_IDENTIFIER_TYPES.EMAIL]: {
      value: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    [USER_IDENTIFIER_TYPES.PHONE]: {
      value: {
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"],
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    savedLocations: [
      {
        point: {
          longitude: {
            type: Number,
            required: true,
          },
          latitude: {
            type: Number,
            required: true,
          },
        },
        label: {
          type: String,
          required: true,
          trim: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    savedRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    paymentMethods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
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
    validateBeforeSave: true,
  }
);

CustomerSchema.pre("save", async function (next) {
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

CustomerSchema.pre("validate", function (next) {
  if (!this.email && !this.phoneNumber) {
    next(new Error("At least one of email or phoneNumber is required."));
  } else {
    next();
  }
});

module.exports = mongoose.model("Customer", CustomerSchema);
