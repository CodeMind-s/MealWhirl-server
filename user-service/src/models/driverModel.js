const mongoose = require('mongoose');
const { USER_ACCOUNT_STATUS } = require('../constants/userConstants');

/**
 * DriverSchema defines the structure of the driver document in MongoDB.
 *
 * Required Fields:
 * - `identifier` (Users primary key): The unique identifier for the user.
 */
const DriverSchema = new mongoose.Schema(
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
        vehicle: {
            make: {
                type: String,
                required: true
            },
            model: {
                type: String,
                required: true
            },
            licensePlate: {
                type: String,
                required: true,
                unique: true
            },
            image: String,
            color: String
        },
        location: {
            latitude: Number,
            longitude: Number
        },
        rideHistory: [
            {
                rideId: mongoose.Schema.Types.ObjectId,
                customer: {
                    name: String,
                    customerId: mongoose.Schema.Types.ObjectId
                },
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
                }
            }
        ],
        ratings: {
            average: {
                type: Number,
                default: 0
            },
            totalRides: {
                type: Number,
                default: 0
            }
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
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
DriverSchema.pre('validate', function (next) {
    if (!this.email && !this.phoneNumber) {
        next(new Error('At least one of email or phoneNumber is required.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Driver', DriverSchema);