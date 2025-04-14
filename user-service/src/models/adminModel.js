const mongoose = require('mongoose');
const { ADMIN_TYPES } = require('../constants/userConstants');

const AdminSchema = new mongoose.Schema({
    identifier: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
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
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ADMIN_TYPES,
        required: true,
    },
    permissions: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

// Custom validation to ensure at least one of email or phoneNumber is provided
AdminSchema.pre('validate', function (next) {
    if (!this.email && !this.phoneNumber) {
        next(new Error('At least one of email or phoneNumber is required.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Admin', AdminSchema);