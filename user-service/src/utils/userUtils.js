const { USER_CATEGORIES } = require("../constants/userConstants");
const BadRequestException = require("../exceptions/BadRequestException");
const adminModel = require("../models/adminModel");
const customerModel = require("../models/customerModel");
const driverModel = require("../models/driverModel");
const restaurantModel = require("../models/restaurantModel");
const logger = require("./logger");

const categoryModelMap = {
    [USER_CATEGORIES.CUSTOMER]: customerModel,
    [USER_CATEGORIES.DRIVER]: driverModel,
    [USER_CATEGORIES.RESTAURANT]: restaurantModel,
    [USER_CATEGORIES.ADMIN]: adminModel,
    [USER_CATEGORIES.SUPER_ADMIN]: adminModel,
};
const getOwner = async (inputParameters) => {
    const { id, identifier } = inputParameters;
    return id ?? identifier;
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
    categoryModelMap,
}