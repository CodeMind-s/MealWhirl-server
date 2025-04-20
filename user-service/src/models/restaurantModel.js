const mongoose = require('mongoose');
const { USER_ACCOUNT_STATUS } = require('../constants/userConstants');

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
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    menu: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          unique: true // Ensure each menu item has a unique name
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
          max: 5
        },
        isAvailable: {
          type: Boolean,
          default: true
        }
      }
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    accountStatus: {
      type: String,
      enum: Object.values(USER_ACCOUNT_STATUS),
      default: USER_ACCOUNT_STATUS.INACTIVE,
    },
  },
  {
    timestamps: true
  }
);

// Custom validation to ensure at least one of email or phoneNumber is provided
RestaurantSchema.pre('validate', function (next) {
  if (!this.email && !this.phoneNumber) {
    next(new Error('At least one of email or phoneNumber is required.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);