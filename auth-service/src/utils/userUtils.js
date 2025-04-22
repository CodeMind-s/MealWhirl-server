const jwt = require("jsonwebtoken");
const { USER_CATEGORIES, USER_CATEGORY_TO_ID_MAP } = require("../constants/userConstants");
const adminModel = require("../models/adminModel");
const customerModel = require("../models/customerModel");
const driverModel = require("../models/driverModel");
const restaurantModel = require("../models/restaurantModel");
const { TOKEN_SECRET, TOKEN_EXPIRATION, ISSUER, TENANT, ALGORITHM } = require("../constants/configConstants");

const categoryModelMap = {
    [USER_CATEGORIES.CUSTOMER]: customerModel,
    [USER_CATEGORIES.DRIVER]: driverModel,
    [USER_CATEGORIES.RESTAURANT]: restaurantModel,
    [USER_CATEGORIES.ADMIN]: adminModel,
};

const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        role: user.category,
        id: user.identifier,
        roleId: USER_CATEGORY_TO_ID_MAP[user.category],
      },
      tenant: TENANT,
    },
    TOKEN_SECRET,
    { algorithm: ALGORITHM, expiresIn: TOKEN_EXPIRATION, issuer: ISSUER }
  );
};

const getOwner = async (inputParameters) => {
    const { id } = inputParameters;
    return id;
}

const getModelByCategory = (category) => {
    const userObject = categoryModelMap[category];
    if (!userObject) {
        logger.error('Invalid category');
        throw new BadRequestException(`Invalid category: ${category}`);
    }
    return userObject;
};

module.exports = {
    getOwner,
    getModelByCategory,
    generateToken,
}