const jwt = require('jsonwebtoken');
const { TOKEN_SECRET, TENANT } = require("../constants/configConstants");
const User = require('../models/userModel');
const logger = require('../utils/logger');
const userService = require('./userService');
const { USER_ACCOUNT_STATUS, USER_CATEGORIES, USER_CATEGORY_TO_ID_MAP } = require("../constants/userConstants");
const ForbiddenException = require('../exceptions/ForbiddenException');

const ALGORITH = 'RS256';
const EXPIRES_IN = '1h';

const login = async (payload) => {
    try {
        const { identifier, password } = payload;

        const user = await userService.getUserByIdentifier(identifier);

        if (!user) {
            logger.error('User not found');
            return { status: 404, data: { message: 'User not found' } };
        }

        if (!user.verified) {
            logger.error('User not verified');
            return { status: 403, data: { message: 'User not verified' } };
        }

        const isValid = await User.verifyPassword(password, user.password);
        if (!isValid) {
            logger.error('Invalid password');
            return { status: 401, data: { message: 'Invalid password' } };
        }

        const token = jwt.sign({ user: { role: user.category, id: user.identifier, roleId: USER_CATEGORY_TO_ID_MAP[user.category] }, tenant: TENANT }, TOKEN_SECRET, { algorithm: ALGORITH, expiresIn: EXPIRES_IN });
        return { token, identifier: user.identifier, category: user.category || null, type: user.type };
    } catch (error) {
        throw error;
    }
}

/**
 * Register a new user (verified is true by default) TODO: add verification to identifier
 * @param payload
 * @returns {Promise<{type}|{status: number, data: {message: string}}>}
 */
const register = async (payload) => {
    try {
        const { type, password } = payload;
        const identifier = payload[type];

        const user = await User.findOne({ identifier });
        const encryptedPassword = await User.encryptPassword(password);
        if (user && user.accountStatus === USER_ACCOUNT_STATUS.CREATING) {
            const updatedUser = await User.findOneAndUpdate(
                { identifier },
                { type, verified: true, password: encryptedPassword, accountStatus: USER_ACCOUNT_STATUS.CREATING, category: USER_CATEGORIES.REGISTERD },
                { new: true }
            );
            return { [type]: updatedUser.identifier, type };
        } else if (user) {
            return new ForbiddenException('User already exists', 403);
        }

        const newUser = new User({
            identifier, type, verified: true, password: encryptedPassword, accountStatus: USER_ACCOUNT_STATUS.CREATING, category: USER_CATEGORIES.REGISTERD
        });
        await newUser.save();

        return { [type]: identifier, type };
    } catch (error) {
        logger.error('Error in register:', error);
        throw error;
    }
}

module.exports = {
    login,
    register
};