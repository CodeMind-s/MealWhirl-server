const {
  USER_CATEGORIES,
  USER_ACCOUNT_STATUS,
  USER_IDENTIFIER_TYPES,
} = require("../constants/userConstants");
const User = require("../models/userModel");
const logger = require("../utils/logger");
const NotFoundException = require("../exceptions/NotFoundException");
const ConflictException = require("../exceptions/ConflictException");
const BadRequestException = require("../exceptions/BadRequestException");
const ForbiddenException = require("../exceptions/ForbiddenException");
const { getModelByCategory } = require("../utils/userUtils");
const { getUserRole, getUserId } = require("../utils/contextUtils");
const Vehicle = require("../models/vehicleModel");

const getUserByIdentifier = async (identifier, category) => {
  return User.findOne({ identifier, ...(category ? { category } : {}) });
};

const createUserByCategory = async (userData) => {
  logger.profile(`Create user by category: ${userData.category}`);
  try {
    const userId = getUserId();
    const { identifier, category } = userData;

    const user = await getUserByIdentifier(identifier);

    if (!user) {
      logger.error("User not found");
      throw new NotFoundException("User not found");
    }

    if (user.accountStatus !== USER_ACCOUNT_STATUS.CREATING) {
      logger.error("User already created");
      throw new ConflictException("User already created");
    }

    if (userData[user.type] && userData[user.type] !== identifier) {
      logger.error(`User ${user.type} does not match identifier ${identifier}`);
      throw new BadRequestException(
        `User type ${user.type} does not match identifier ${identifier}`
      );
    }

    const isAdmin = category === USER_CATEGORIES.ADMIN;

    if (isAdmin) {
      const userRole = getUserRole();
      if (userRole !== USER_CATEGORIES.SUPER_ADMIN) {
        logger.error("User not authorized to create admin");
        throw new ForbiddenException("User not authorized to create admin");
      }
    }

    const userObject = getModelByCategory(category);

    const categoryToUse = isAdmin ? userData.role : category;

    const { email, phoneNumber, restaurant, ...rest } = userData;
    const userModelData = new userObject({
      ...rest,
      ...(restaurant ? restaurant : {}),
      [user.type]: {
        value: identifier,
        isVerified: true,
      },
      ...(phoneNumber
        ? {
            phoneNumber: {
              value: phoneNumber,
              isVerified: user.type === USER_IDENTIFIER_TYPES.PHONE,
            },
          }
        : {}),
      ...(email
        ? {
            email: {
              value: email,
              isVerified: user.type === USER_IDENTIFIER_TYPES.EMAIL,
            },
          }
        : {}),
      category: categoryToUse,
      accountStatus: USER_ACCOUNT_STATUS.ACTIVE,
      createdBy: userId,
      updatedBy: userId,
    });

    if (categoryToUse === USER_CATEGORIES.DRIVER) {
      const vehicle = await Vehicle.findOne({ driver: identifier });
      if (!vehicle) {
        logger.error("Vehicle not found for this driver");
        throw new NotFoundException("Vehicle not found for this driver");
      }
      await Vehicle.findOneAndUpdate(
        { driver: identifier },
        {
          verified: true,
        }
      );
    }

    const createdUser = await userModelData.save();

    await User.findOneAndUpdate(
      { identifier },
      {
        verified: true,
        accountStatus: USER_ACCOUNT_STATUS.ACTIVE,
        category: categoryToUse,
        updatedBy: userId,
      }
    );

    return {
      ...createdUser._doc,
      verified: true,
      type: user.type,
      accountStatus: USER_ACCOUNT_STATUS.ACTIVE,
    };
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    throw error;
  } finally {
    logger.profile(`Create user by category: ${userData.category}`);
  }
};

const getAllUsersByCategory = async (category) => {
  try {
    let users = null;
    const userObject = getModelByCategory(category);

    users = await userObject.find({
      accountStatus: USER_ACCOUNT_STATUS.ACTIVE,
    });
    return users;
  } catch (error) {
    logger.error("Error fetching users:", error.message);
    throw error;
  }
};

const getUserDataByIdentifierAndCategory = async (category, identifier) => {
  try {
    const isAdmin = category === USER_CATEGORIES.ADMIN;
    const filterCategory = isAdmin ? null : category;

    const user = await getUserByIdentifier(identifier, filterCategory);

    if (!user) {
      logger.error("User not found");
      throw new NotFoundException("User not found");
    }
    if (user.accountStatus !== USER_ACCOUNT_STATUS.ACTIVE) {
      logger.error("User not active");
      throw new ConflictException("User not active");
    }

    const categoryToUse = isAdmin ? user.category : category;
    const userObject = getModelByCategory(categoryToUse);

    const userData = await userObject.findOne({ identifier });
    return {
      ...userData._doc,
      verified: user.verified,
      type: user.type,
      accountStatus: user.accountStatus,
    };
  } catch (error) {
    logger.error("Error fetching user:", error.message);
    throw error;
  }
};

const updateUserByCategory = async (userData) => {
  try {
    const userId = getUserId();
    const { identifier, category } = userData;

    const filterCategory = category === USER_CATEGORIES.ADMIN ? null : category;

    const user = await getUserByIdentifier(identifier, filterCategory);

    if (!user) {
      logger.error("User not found");
      throw new NotFoundException("User not found");
    }

    if (user.accountStatus !== USER_ACCOUNT_STATUS.ACTIVE) {
      logger.error("User not active");
      throw new ConflictException("User not active");
    }

    if (userData[user.type] && userData[user.type] !== identifier) {
      logger.error(`User ${user.type} does not match identifier ${identifier}`);
      throw new BadRequestException(
        `User type ${user.type} does not match identifier ${identifier}`
      );
    }

    const tokenUser = getUserRole();
    if (
      tokenUser !== USER_CATEGORIES.SUPER_ADMIN &&
      user.category === USER_CATEGORIES.SUPER_ADMIN
    ) {
      logger.error("Super admin cannot be updated");
      throw new ForbiddenException("Super admin cannot be updated");
    }

    const userObject = getModelByCategory(category);

    const { email, phoneNumber, restaurant, ...rest } = userData;

    const updatedUser = await userObject.findOneAndUpdate(
      { identifier },
      {
        ...rest,
        ...(restaurant ? restaurant : {}),
        ...(email
          ? {
              email: {
                value: email,
                isVerified: user.type === USER_IDENTIFIER_TYPES.EMAIL,
              },
            }
          : {}),
        ...(phoneNumber
          ? {
              phoneNumber: {
                value: phoneNumber,
                isVerified: user.type === USER_IDENTIFIER_TYPES.PHONE,
              },
            }
          : {}),
        updatedBy: userId,
      },
      { new: true }
    );

    return {
      ...updatedUser._doc,
      verified: user.verified,
      type: user.type,
      accountStatus: user.accountStatus,
    };
  } catch (error) {
    logger.error("Error updating user:", error.message);
    throw error;
  }
};

const updateUserAccountStatusByIdentifier = async (userData, status) => {
  try {
    if (!status) {
      logger.error("Status is required");
      throw new BadRequestException("Status is required");
    }
    const { identifier, category } = userData;

    const filterCategory = category === USER_CATEGORIES.ADMIN ? null : category;

    const user = await getUserByIdentifier(identifier, filterCategory);

    if (!user) {
      logger.error("User not found");
      throw new NotFoundException("User not found");
    }

    if (user.accountStatus === status) {
      logger.error(`User already has status: ${status}`);
      throw new ConflictException(`User already has status: ${status}`);
    }

    const tokenUser = getUserRole();
    if (
      tokenUser !== USER_CATEGORIES.SUPER_ADMIN &&
      user.category === USER_CATEGORIES.SUPER_ADMIN
    ) {
      logger.error("Super admin cannot be updated");
      throw new ForbiddenException("Super admin cannot be updated");
    }

    if (
      status === USER_ACCOUNT_STATUS.DELETED &&
      user.category === USER_CATEGORIES.SUPER_ADMIN
    ) {
      logger.error("Super admin cannot be deleted");
      throw new ForbiddenException("Super admin cannot be deleted");
    }

    const userObject = getModelByCategory(category);

    await userObject.findOneAndUpdate(
      { identifier },
      { accountStatus: status }
    );

    await User.findOneAndUpdate({ identifier }, { accountStatus: status });

    return {};
  } catch (error) {
    logger.error("Error deleting user:", error.message);
    throw error;
  }
};

const deleteAccountByIdentifier = async (userData, status) => {
  try {
    const { identifier, category } = userData;

    const filterCategory = category === USER_CATEGORIES.ADMIN ? null : category;

    const user = await getUserByIdentifier(identifier, filterCategory);

    if (!user) {
      logger.error("User not found");
      throw new NotFoundException("User not found");
    }

    if (user.accountStatus === USER_ACCOUNT_STATUS.DELETED) {
      logger.error("User already deleted");
      throw new ConflictException("User already deleted");
    }

    if (user.category === USER_CATEGORIES.SUPER_ADMIN) {
      logger.error("Super admin cannot be deleted");
      throw new ForbiddenException("Super admin cannot be deleted");
    }

    const userObject = getModelByCategory(category);

    await userObject.findOneAndDelete({ identifier });

    await User.findOneAndDelete({ identifier });

    return {};
  } catch (error) {
    logger.error("Error deleting user:", error.message);
    throw error;
  }
};

const getUserDataByIdentifier = async (identifier) => {
  try {
    const user = await getUserByIdentifier(identifier);

    if (!user) {
      logger.error("User not found");
      return null;
    }
    let userData = null;
    if (user.accountStatus === USER_ACCOUNT_STATUS.ACTIVE) {
      const categoryToUse =
        user.category === USER_CATEGORIES.SUPER_ADMIN
          ? USER_CATEGORIES.ADMIN
          : user.category;
      const userObject = getModelByCategory(categoryToUse);

      const result = await userObject.findOne({ identifier });
      if (!result) {
        logger.error("User data not found");
        throw new NotFoundException("User data not found");
      }
      userData = result._doc;
    }

    return {
      ...(userData ? { accountData: userData } : {}),
      ...user._doc,
    };
  } catch (error) {
    logger.error("Error fetching user:", error.message);
    throw error;
  }
};

module.exports = {
  createUserByCategory,
  getUserByIdentifier,
  getAllUsersByCategory,
  getUserDataByIdentifierAndCategory,
  updateUserByCategory,
  updateUserAccountStatusByIdentifier,
  deleteAccountByIdentifier,
  getUserDataByIdentifier,
};
