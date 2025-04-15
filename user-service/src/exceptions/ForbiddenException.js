const StatusCodes  = require('http-status-codes');
const ApiException = require('./ApiException');

const { FORBIDDEN } = StatusCodes;

class ForbiddenException extends ApiException {
  constructor(message, statusCode = FORBIDDEN, errorCode = FORBIDDEN) {
    super(message, statusCode, errorCode);
    this.name = 'forbiddenException';
  }
}

module.exports = ForbiddenException;