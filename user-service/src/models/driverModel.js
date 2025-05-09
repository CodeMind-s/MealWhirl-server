const mongoose = require("mongoose");
const {
  USER_ACCOUNT_STATUS,
  USER_IDENTIFIER_TYPES,
} = require("../constants/userConstants");
const User = require("./userModel");

const DriverSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      unique: true,
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
    city: {
      type: String,
      required: true,
      trim: true,
    },
    driverLicense: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    nationalId: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
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
    validateBeforeSave: true,
  }
);

DriverSchema.pre("save", async function (next) {
  try {
    if (this.vehicle) {
      const vehicleExists = await mongoose.model("Vehicle").exists({ _id: this.vehicle });
      if (!vehicleExists) {
        return next(new Error("The referenced `vehicle` does not exist."));
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

DriverSchema.pre("save", async function (next) {
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

DriverSchema.pre("validate", function (next) {
  if (!this.email && !this.phoneNumber) {
    next(new Error("At least one of email or phoneNumber is required."));
  } else {
    next();
  }
});

module.exports = mongoose.model("Driver", DriverSchema);
