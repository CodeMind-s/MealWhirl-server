const { getUserId } = require("../utils/contextUtils");
const commonUserService = require("./commonUserService");
const ForbiddenException = require("../exceptions/ForbiddenException");
const logger = require("../utils/logger");
const { USER_CATEGORIES } = require("../constants/userConstants");
const Restaurant = require("../models/restaurantModel");

const getMenuItemByName = async (menuItem) => {
  logger.profile("Getting menu item by name");
  try {
    const { identifier, menuId } = menuItem;
    const userCategory = USER_CATEGORIES.RESTAURANT;
    const user = await commonUserService.getUserByIdentifier(
      identifier,
      userCategory
    );

    if (!user) {
      logger.error(`${userCategory} not found`);
      throw new ForbiddenException(`${userCategory} not found`);
    }
    const restaurant = await Restaurant.findOne({
      identifier: identifier,
      "menu.name": menuId,
    });
    if (!restaurant) {
      const message = `Menu item with name ${menuId} not found for this restaurant`;
      logger.error(message);
      throw new ForbiddenException(message);
    }
    return restaurant.menu.find((item) => item.name === menuId);
  } catch (error) {
    logger.error(`Error getting menu item: ${error.message}`);
    throw error;
  } finally {
    logger.profile("Getting menu item by name");
  }
};

const addMenuItem = async (menuItem) => {
  logger.profile("Adding menu item");
  try {
    const userId = getUserId();
    const userCategory = USER_CATEGORIES.RESTAURANT;
    const { identifier, menu } = menuItem;
    const user = await commonUserService.getUserByIdentifier(
      identifier,
      userCategory
    );

    if (!user) {
      logger.error(`${userCategory} not found`);
      throw new ForbiddenException(`${userCategory} not found`);
    }

    const restaurantWithItem = await Restaurant.findOne({
      identifier: identifier,
      "menu.name": menu.name,
    });

    if (restaurantWithItem) {
      const message = `Menu item with name ${menu.name} already exists for this restaurant`;
      logger.error(message);
      throw new ForbiddenException(message);
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { identifier: identifier },
      {
        $push: {
          menu: menu,
        },
        $set: {
          updatedBy: userId,
        },
      },
      { new: true }
    );

    return restaurant;
  } catch (error) {
    logger.error(`Error adding payment method: ${error.message}`);
    throw error;
  } finally {
    logger.profile("Adding payment method");
  }
};

const updateMenuItem = async (menuItem) => {
  logger.profile("Updating menu item");
  try {
    const userId = getUserId();
    const userCategory = USER_CATEGORIES.RESTAURANT;
    const { identifier, menu } = menuItem;
    const user = await commonUserService.getUserByIdentifier(
      identifier,
      userCategory
    );

    if (!user) {
      logger.error(`${userCategory} not found`);
      throw new ForbiddenException(`${userCategory} not found`);
    }

    const restaurantWithItem = await Restaurant.findOne({
      identifier: identifier,
      "menu.name": menu.name,
    });

    if (!restaurantWithItem) {
      const message = `Menu item with name ${menu.name} not found for this restaurant`;
      logger.error(message);
      throw new ForbiddenException(message);
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { identifier: identifier },
      {
        $set: {
          "menu.$[elem]": menu,
          updatedBy: userId,
        },
      },
      { arrayFilters: [{ "elem.name": menu.name }], new: true }
    );

    return restaurant;
  } catch (error) {
    logger.error(`Error updating payment method: ${error.message}`);
    throw error;
  } finally {
    logger.profile("Updating payment method");
  }
};

const deleteMenuItem = async (menuItem) => {
  logger.profile("Deleting menu item");
  try {
    const userId = getUserId();
    const userCategory = USER_CATEGORIES.RESTAURANT;
    const { identifier, menuId } = menuItem;
    const user = await commonUserService.getUserByIdentifier(
      identifier,
      userCategory
    );

    if (!user) {
      logger.error(`${userCategory} not found`);
      throw new ForbiddenException(`${userCategory} not found`);
    }

    const restaurantWithItem = await Restaurant.findOne({
      identifier: identifier,
      "menu.name": menuId,
    });

    if (!restaurantWithItem) {
      const message = `Menu item with name ${mmenuId} not found for this restaurant`;
      logger.error(message);
      throw new ForbiddenException(message);
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { identifier: identifier },
      {
        $pull: {
          menu: { name: menuId },
        },
        $set: {
          updatedBy: userId,
        },
      },
      { new: true }
    );

    return restaurant;
  } catch (error) {
    logger.error(`Error deleting payment method: ${error.message}`);
    throw error;
  } finally {
    logger.profile("Deleting payment method");
  }
};

module.exports = {
  getMenuItemByName,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
