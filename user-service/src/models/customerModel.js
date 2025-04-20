const mongoose = require('mongoose');
const { USER_ACCOUNT_STATUS } = require('../constants/userConstants');

/**
 * CustomerSchema defines the structure of the user document in MongoDB.
 *
 * Required Fields:
 * - `identifier` (Users primary key): The unique identifier for the user.
 */
const CustomerSchema = new mongoose.Schema(
    {
        identifier: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
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
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        isPhoneVerified: {
            type: Boolean,
            default: false
        },
        profilePicture: {
            type: String, // URL to the profile picture
            trim: true
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
                latitude: Number,
                longitude: Number
            }
        },
        saved: [
            {
                latitude: Number,
                longitude: Number,
                label: String, // e.g., "Home", "Work", "Gym"
                isPrimary: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        paymentMethods: [
            {
                referenceId: {
                    type: String,
                    required: true
                },
                default: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        rideHistory: [
            {
                rideId: mongoose.Schema.Types.ObjectId,
                pickupLocation: {
                    latitude: Number,
                    longitude: Number
                },
                dropOffLocation: {
                    latitude: Number,
                    longitude: Number
                },
                fare: {
                    amount: Number,
                    currency: String,
                    paymentMethod: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'PaymentMethod' // Reference to the PaymentMethod collection
                    }
                },
                date: {
                    type: Date,
                    default: Date.now
                },
                driver: {
                    name: String,
                    driverId: mongoose.Schema.Types.ObjectId
                },
                vehicle: {
                    make: String,
                    model: String,
                    licensePlate: String
                }
            }
        ],
        accountStatus: {
            type: String,
            enum: Object.values(USER_ACCOUNT_STATUS),
            default: USER_ACCOUNT_STATUS.INACTIVE,
        },
    },
    {
        timestamps: true,
        validateBeforeSave: true
    }
);

// Custom validation to ensure at least one of email or phoneNumber is provided
CustomerSchema.pre('validate', function (next) {
    if (!this.email && !this.phoneNumber) {
        next(new Error('At least one of email or phoneNumber is required.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Customer', CustomerSchema);