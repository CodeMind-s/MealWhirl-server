const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { USER_IDENTIFIER_TYPES, USER_CATEGORIES, USER_ACCOUNT_STATUS, DEFAULT_USER_ACCOUNT_STATUS} = require('../constants/userConstants');

const UserSchema = new mongoose.Schema({
    identifier: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(USER_IDENTIFIER_TYPES),
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    accountStatus: {
        type: String,
        enum: Object.values(USER_ACCOUNT_STATUS),
        required: true,
    },
    category: {
        type: String,
        enum: Object.values(USER_CATEGORIES),
        required: this.accountStatus === USER_ACCOUNT_STATUS.ACTIVE,
    },
}, {
    timestamps: true
});

// Static method to encrypt a password
UserSchema.statics.encryptPassword = async function (password) {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    return await bcrypt.hash(password, saltRounds);
};

// Static method to verify a password
UserSchema.statics.verifyPassword = async function (password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
};

module.exports = mongoose.model('User', UserSchema);