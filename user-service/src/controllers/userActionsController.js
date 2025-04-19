const { appendExceptionStack } = require("../utils/exceptionUtils");
const { createSuccessResponse } = require("../utils/responseGenerator");
const userActionsService = require('../services/userActionsService');

const updateUserItemsByCategory = async (req, res, next) => {
    const { category, id: identifier } = req.params;
    userActionsService.updateUserItemsByCategory({ ...req.body, category, identifier })
      .then((value) => res.status(200).json(createSuccessResponse(value)))
      .catch((err) => next(appendExceptionStack(err)));
  }

  module.exports = {
    updateUserItemsByCategory
  }