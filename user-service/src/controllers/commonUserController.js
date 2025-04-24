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

const getUserByIdentifierAndCategory = async (req, res, next) => {
  const { category, id: identifier } = req.params;
  userService.getUserDataByIdentifierAndCategory(category, identifier)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const updateUserByCategoryAndIdentifier = async (req, res, next) => {
  const { category, id: identifier } = req.params;
  userService.updateUserByCategoryAndIdentifier({ ...req.body, category, identifier })
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const updateUserAccountStatusByCategoryAndIdentifier = async (req, res, next) => {
  const { category, id: identifier } = req.params;
  const { status } = req.body;
  userService.updateUserAccountStatusByCategoryAndIdentifier({ category, identifier }, status)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const deleteAccountByCategoryAndIdentifier = async (req, res, next) => {
  const { category, id: identifier } = req.params;
  userService.deleteAccountByCategoryAndIdentifier({ category, identifier })
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const getUserDataByIdentifier = async (req, res, next) => {
  const { identifier } = req.body;
  userService.getUserDataByIdentifier(identifier)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const updateUserByIdentifier = async (req, res, next) => {
  userService.updateUserByIdentifier(req.body)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

const createUserByIdentifier = async (req, res, next) => {
  userService.createUserByIdentifier(req.body)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

module.exports = {
  createUserByCategory,
  getAllUsersByCategory,
  getUserByIdentifierAndCategory,
  updateUserByCategoryAndIdentifier,
  updateUserAccountStatusByCategoryAndIdentifier,
  deleteAccountByCategoryAndIdentifier,
  getUserDataByIdentifier,
  updateUserByIdentifier,
  createUserByIdentifier
}
