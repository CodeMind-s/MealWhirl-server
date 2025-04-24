const restaurantService = require("../services/restaurantService");
const { createSuccessResponse } = require("../utils/responseGenerator");
const { appendExceptionStack } = require("../utils/exceptionUtils");

const getMenuItemByName = async (req, res, next) => {
  const { id: identifier, menuId } = req.params;
  restaurantService
    .getMenuItemByName({ identifier, menuId })
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
};

const addMenuItem = async (req, res, next) => {
  restaurantService
    .addMenuItem(req.body)
    .then((value) => res.status(201).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
};

const updateMenuItem = async (req, res, next) => {
  restaurantService
    .updateMenuItem(req.body)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
};

const deleteMenuItem = async (req, res, next) => {
  const { id: identifier, menuId } = req.params;
  restaurantService
    .deleteMenuItem({ identifier, menuId })
    .then((value) => res.status(204).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
};

module.exports = {
  getMenuItemByName,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
