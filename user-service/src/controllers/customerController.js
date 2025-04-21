const customerService = require("../services/customerService");
const { createSuccessResponse } = require("../utils/responseGenerator");
const { appendExceptionStack } = require("../utils/exceptionUtils");

const addPaymentMethod = async (req, res, next) => {
  customerService
    .addPayemntMethod(req.body)
    .then((value) => res.status(201).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
};

const removePaymentMethod = async (req, res, next) => {
  customerService
    .removePaymentMethod(req.body)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
};

module.exports = {
  addPaymentMethod,
  removePaymentMethod,
};
