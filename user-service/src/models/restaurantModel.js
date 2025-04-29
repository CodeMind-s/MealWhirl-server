const mongoose = require("mongoose");
const {
  USER_ACCOUNT_STATUS,
  USER_IDENTIFIER_TYPES,
} = require("../constants/userConstants");
const User = require("./userModel");

/**
 * RestaurantSchema defines the structure of the restaurant document in MongoDB.
 *
 * Required Fields:
 * - `identifier` (Users primary key): The unique identifier for the restaurant.
 **/
const RestaurantSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
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
    address: {
      type: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
      },
      required: true, // Make the entire address object mandatory
    },
    location: {
      type: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
      required: true, // Make the entire location object mandatory
    },
    paymentMethods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    registrationNumber: {
      type: String,
      required: true,
    },
    owner: {
      type: {
        name: { type: String, required: true },
        email: {
          type: String,
          trim: true,
          lowercase: true,
          match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        phone: {
          type: String,
          trim: true,
          match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"],
        },
        nationalId: { type: String, required: true },
      },
      required: true, // Make the entire owner object mandatory
    },
    menu: [
      {
        name: {
          type: String,
          trim: true,
          required: function () {
            return this.name !== undefined; // Make `name` required only if it exists
          },
          unique: false, // Disable MongoDB's native unique constraint
          validate: {
            validator: async function (value) {
              if (!value) return true; // Skip validation if `name` is not provided
              const existingMenuItem = await mongoose.models.Restaurant.findOne(
                {
                  _id: { $ne: this._id }, // Exclude the current restaurant
                  "menu.name": value, // Check if the name exists in other restaurants
                }
              );
              return !existingMenuItem; // Return false if a duplicate is found
            },
            message: "Menu item name must be unique.",
          },
        },
        description: String,
        price: Number,
        image: String, // URL to the image
        ingredients: [String], // List of ingredients
        dietaryRestrictions: [String], // e.g., Vegan, Gluten-Free
        category: String, // e.g., Appetizer, Main Course, Dessert
        rating: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    accountStatus: {
      type: String,
      enum: Object.values(USER_ACCOUNT_STATUS),
      default: USER_ACCOUNT_STATUS.INACTIVE,
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

RestaurantSchema.pre("save", async function (next) {
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

// Custom validation to ensure at least one of email or phoneNumber is provided
RestaurantSchema.pre("validate", function (next) {
  if (!this.email && !this.phoneNumber) {
    next(new Error("At least one of email or phoneNumber is required."));
  } else {
    next();
  }
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
