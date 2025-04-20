const HttpStatus = require('http-status-codes');
const ApiException = require('./ApiException');

class ConflictException extends ApiException {
    constructor(message = 'Conflict', statusCode = HttpStatus.CONFLICT, errorCode = HttpStatus.CONFLICT) {
        super(message, statusCode, errorCode);
        this.name = 'ConflictException';
    }
}

module.exports = ConflictException;