const User = require("../models/userModel");
const logger = require("../utils/logger");
const userService = require("./userService");
const {
  USER_ACCOUNT_STATUS,
  USER_CATEGORIES,
} = require("../constants/userConstants");
const ForbiddenException = require("../exceptions/ForbiddenException");
const { generateToken } = require("../utils/userUtils");

const login = async (payload) => {
  try {
    const { identifier, password } = payload;

    const user = await userService.getUserByIdentifier(identifier);

    if (!user) {
      logger.error("User not found");
      return { status: 404, data: { message: "User not found" } };
    }

    if (!user.verified) {
      logger.error("User not verified");
      return { status: 403, data: { message: "User not verified" } };
    }

    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid) {
      logger.error("Invalid password");
      return { status: 401, data: { message: "Invalid password" } };
    }

    const token = generateToken(user);
    return {
      token,
      identifier: user.identifier,
      category: user.category || null,
      type: user.type,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new user (verified is true by default) TODO: add verification to identifier
 * @param payload
 * @returns {Promise<{type}|{status: number, data: {message: string}}>}
 */
const register = async (payload) => {
  try {
    const { type, password } = payload;
    const identifier = payload[type];

    const user = await userService.getUserByIdentifier(identifier);
    const encryptedPassword = await User.encryptPassword(password);
    if (user && user.accountStatus === USER_ACCOUNT_STATUS.CREATING) {
      const updatedUser = await User.findOneAndUpdate(
        { identifier },
        {
          type,
          verified: true,
          password: encryptedPassword,
          accountStatus: USER_ACCOUNT_STATUS.CREATING,
          category: USER_CATEGORIES.REGISTERD,
        },
        { new: true }
      );
      return { [type]: updatedUser.identifier, type };
    } else if (user) {
      throw new ForbiddenException("User already exists", 403);
    }

    const newUser = new User({
      identifier,
      type,
      verified: true,
      password: encryptedPassword,
      accountStatus: USER_ACCOUNT_STATUS.CREATING,
      category: USER_CATEGORIES.REGISTERD,
    });
    await newUser.save();

    return { [type]: identifier, type };
  } catch (error) {
    logger.error("Error in register:", error);
    throw error;
  }
};

module.exports = {
  login,
  register
};
