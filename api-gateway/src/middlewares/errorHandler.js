const { StatusCodes } = require('http-status-codes');
const httpContext = require('express-http-context');
const { createErrorResponse } = require('../utils/responseGenerator');
const ApiException = require('../exceptions/ApiException');

const { INTERNAL_SERVER_ERROR } = StatusCodes;

const errorHandler = () => {
    return (err, req, res, next) => {
        if (err instanceof ApiException) {
            const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;
            return res.status(statusCode).send(createErrorResponse(err));
        }

        if (err instanceof Error) {
            return res
                .status(INTERNAL_SERVER_ERROR)
                .send(
                    createErrorResponse(
                        err,
                        `Internal server error. Please report incident id : ${httpContext.get('correlation-id')}`
                    )
                );
        }
        return next(err);
    };
}

module.exports = errorHandler;