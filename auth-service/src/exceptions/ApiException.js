const ExtendableError = require('es6-error');

class ApiException extends ExtendableError {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.name = 'ApiException';
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }
}

module.exports = ApiException;
