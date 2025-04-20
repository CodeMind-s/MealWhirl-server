const { StatusCodes } = require('http-status-codes');
const ApiException = require('./ApiException');

const { UNAUTHORIZED } = StatusCodes;

class UnauthorizedException extends ApiException {
    constructor(message, statusCode = UNAUTHORIZED, errorCode = UNAUTHORIZED) {
        super(message, statusCode, errorCode);
        this.name = 'unauthorizedException';
    }
}

module.exports = UnauthorizedException;