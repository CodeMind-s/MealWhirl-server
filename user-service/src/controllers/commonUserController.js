const userService = require('../services/commonUserService');
const { createSuccessResponse } = require("../utils/responseGenerator");
const { appendExceptionStack } = require("../utils/exceptionUtils");

const createUserByCategory = async (req, res, next) => {
  const { category } = req.params;
  userService.createUserByCategory({ ...req.body, category })
    .then((value) => res.status(201).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
};

const getAllUsersByCategory = async (req, res, next) => {
  const { category } = req.params;
  userService.getAllUsersByCategory(category)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const getUserByIdentifier = async (req, res, next) => {
  const { category, id: identifier } = req.params;
  userService.getUserDataByIdentifier(category, identifier)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const updateUserByCategory = async (req, res, next) => {
  const { category, id: identifier } = req.params;
  userService.updateUserByCategory({ ...req.body, category, identifier })
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const updateUserAccountStatusByIdentifier = async (req, res, next) => {
  const { category, id: identifier } = req.params;
  const { status } = req.body;
  userService.updateUserAccountStatusByIdentifier({ category, identifier }, status)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const deleteAccountByIdentifier = async (req, res, next) => {
  const { category, id: identifier } = req.params;
  userService.deleteAccountByIdentifier({ category, identifier })
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

module.exports = {
  createUserByCategory,
  getAllUsersByCategory,
  getUserByIdentifier,
  updateUserByCategory,
  updateUserAccountStatusByIdentifier,
  deleteAccountByIdentifier
}
