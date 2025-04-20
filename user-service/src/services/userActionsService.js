const ConflictException = require("../exceptions/ConflictException");
const NotFoundException = require("../exceptions/NotFoundException");
const { getUserId } = require("../utils/contextUtils");
const logger = require("../utils/logger");
const { getModelByCategory } = require("../utils/userUtils");
const { getUserByIdentifier } = require("./commonUserService");
const { USER_ACCOUNT_STATUS, USER_CATEGORIES } = require("../constants/userConstants");

/**
 * 
 * @description Updates user items by category
 * @param {Object} params - Parameters for the function
 * @param {string} params.category - Category of the user
 * @param {Object} params.optionKey - Item Key 
 * @param {Object} params.item - Item to be added
 * @param {string} params.identifier - Identifier of the user
 * @returns 
 */
const updateUserItemsByCategory = async ({ category, optionKey, item, identifier }) => {
    try {
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

        const userObject = getModelByCategory(category);
        const userData = await userObject.findOne({ identifier });
        const existingItems = userData[optionKey] || [];
        const itemExists = existingItems.some(existingItem => existingItem.name === item.name);
        if (itemExists) {
            logger.error("Item already exists in the list");
            throw new ConflictException("Item already exists in the list");
        }
        const updatedOptions = [...existingItems, item];

        const updatedUser = await userObject.findOneAndUpdate({ identifier }, { [optionKey]: updatedOptions }, { new: true });

        return updatedUser;
    } catch (error) {
        logger.error("Error updating user items:", error.message);
        throw error;
    }
};

const deleteUserItemsByCategory = async ({ category, optionKey, name, identifier }) => {
    try {
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

        const userObject = getModelByCategory(category);
        const userData = await userObject.findOne({ identifier });
        const existingItems = userData[optionKey] || [];
        const itemExists = existingItems.some(existingItem => existingItem.name === name);
        if (!itemExists) {
            logger.error("Item not found in the list");
            throw new ConflictException("Item not found in the list");
        }
        const updatedOptions = existingItems.filter(existingItem => existingItem.name !== name);

        const updatedUser = await userObject.findOneAndUpdate({ identifier }, { [optionKey]: updatedOptions }, { new: true });

        return updatedUser;
    } catch (error) {
        logger.error("Error deleting user items:", error.message);
        throw error;
    }
}

module.exports = {
    updateUserItemsByCategory,
    deleteUserItemsByCategory
};
