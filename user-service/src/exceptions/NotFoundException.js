const HttpStatus = require('http-status-codes');
const ApiException = require('./ApiException');

class NotFoundException extends ApiException {
    constructor(message = 'Not Found', statusCode = HttpStatus.NOT_FOUND, errorCode = HttpStatus.NOT_FOUND) {
        super(message, statusCode, errorCode);
        this.name = 'NotFoundException';
    }
}

module.exports = NotFoundException;