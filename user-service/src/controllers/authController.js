const authService = require('../services/authService');
const {appendExceptionStack} = require("../utils/exceptionUtils");
const {createSuccessResponse} = require("../utils/responseGenerator");

const login = async (req, res, next) => {
    authService.login(req.body).then((value) => res.status(201).json(createSuccessResponse(value)))
        .catch((err) => next(appendExceptionStack(err)));
}

const register = async (req, res, next) => {
    authService.register(req.body).then((value) => res.status(201).json(createSuccessResponse(value)))
        .catch((err) => next(appendExceptionStack(err)));
}

module.exports = {
    login,
    register
}