const mongoose = require("mongoose");
const User = require("./userModel");

const VehicleSchema = new mongoose.Schema(
  {
    driver: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    licensePlate: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleInsurance: {
      type: {
        policyNumber: {
          type: String,
          required: true,
          trim: true,
        },
        vendor: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    images: {
      type: {
        front: {
          type: String,
          required: true,
        },
        back: {
          type: String,
          required: true,
        },
        side: {
          type: String,
          required: true,
        },
      },
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

VehicleSchema.pre("save", async function (next) {
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

module.exports = mongoose.model("Vehicle", VehicleSchema);
