const ApiException = require('./ApiException');

class RestClientException extends ApiException {
    constructor(message, statusCode = 500, errorCode = 'REST_CLIENT_ERROR', details = null) {
        super(message, statusCode, errorCode);
        this.name = 'RestClientException';
        this.details = details; // Additional details about the error
    }
}

module.exports = RestClientException;