const winston = require('winston');
const httpContext = require('express-http-context');
const { ENV, USER_DETAILS_CONTEXT_KEY } = require('../constants/configConstants');

/**
 * Create a new winston logger.
 */
const level = ENV === 'test' ? 'debug' : 'info';
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.printf((info) => {
                    const userDetails = httpContext.get(USER_DETAILS_CONTEXT_KEY);
                    const correlationId = httpContext.get('correlation-id') || 'NO_CORRELATION';
                    const tenantCode = userDetails ? userDetails.tenant.tenantIdentifier : 'NO_TENANT';
                    return `${info.level}|${correlationId}|${tenantCode}|${info.timestamp}:${info.message}`;
                })
            ),
            level
        }),
        new winston.transports.Console({
            format: winston.format.combine(winston.format.prettyPrint()),
            level: 'error'
        })
    ]
});

exports.logStream = {
    /**
     * A writable stream for winston logger.
     *
     * @param {any} message
     */
    write(message) {
        logger.info(message.toString());
    }
};

module.exports = logger;
