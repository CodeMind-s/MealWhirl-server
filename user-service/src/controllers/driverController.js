const driverService = require("../services/driverService");
const { createSuccessResponse } = require("../utils/responseGenerator");
const { appendExceptionStack } = require("../utils/exceptionUtils");

const createVehicle = async (req, res, next) => {
  driverService.createVehicle(req.body)
    .then((value) => res.status(201).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
};

const updateVehicle = async (req, res, next) => {
  driverService.updateVehicle(req.body)
    .then((value) => res.status(200).json(createSuccessResponse(value)))
    .catch((err) => next(appendExceptionStack(err)));
}

module.exports = {
    createVehicle,
    updateVehicle
};