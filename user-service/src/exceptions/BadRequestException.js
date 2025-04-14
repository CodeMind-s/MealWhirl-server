const HttpStatus = require('http-status-codes');
const ApiException = require('./ApiException');

class BadRequestException extends ApiException {
    constructor(message = 'Bad Request', statusCode = HttpStatus.BAD_REQUEST, errorCode = HttpStatus.BAD_REQUEST) {
        super(message, statusCode, errorCode);
        this.name = 'BadRequestException';
    }
}

module.exports = BadRequestException;