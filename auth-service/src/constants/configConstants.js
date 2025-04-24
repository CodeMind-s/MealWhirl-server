/**
 * Application Constants
 */
const BASE_URL = "/";
const APP_PORT =
    (process.env.NODE_ENV === 'test' ? process.env.TEST_APP_PORT : process.env.APP_PORT) || process.env.PORT || '3000';
const APP_HOST = process.env.APP_HOST || '0.0.0.0';
const USER_SERVICE_PORT = process.env.USER_SERVICE_PORT || '5003';
const ENV = process.env.ENV || 'test';
const TOKEN_SECRET = ENV === 'test'?  process.env.TEST_TOKEN_SECRET?.replace(/\\n/g, '\n') || '' : process.env.TOKEN_SECRET?.replace(/\\n/g, '\n') || ''; // move this to secure place
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '1h';
const ALGORITHM = process.env.ALGORITHM || 'RS256';
const ISSUER = process.env.ISSUER || 'auth-service';
const TENANT = {
    tenantIdentifier: process.env.TENANT_IDENTIFIER || 'tenant_identifier',
    dbIdentifier: process.env.DB_IDENTIFIER || 'db_identifier'
}

/**
 * Request Context
 */
const USER_DETAILS_CONTEXT_KEY = 'userDetails';
const AUTHORIZATION_CONTEXT_KEY = 'authorization';
const CORRELATION_ID_CONTEXT_KEY = 'correlation-id';
const DB_SCHEMA_SUFFIX = '';
const KEEP_ALIVE_TIME_OUT = 185000;
const HEADERS_TIME_OUT = 80000;

/**
 * Logging Constants
 */
const IMMEDIATE_LOG_FORMAT = '[Start Request] :method :url';
const LOG_FORMAT = '[End Request] :method :url :status :res[content-length] - :response-time ms';

module.exports = {
    ENV,
    BASE_URL,
    APP_PORT,
    APP_HOST,
    USER_DETAILS_CONTEXT_KEY,
    AUTHORIZATION_CONTEXT_KEY,
    CORRELATION_ID_CONTEXT_KEY,
    DB_SCHEMA_SUFFIX,
    KEEP_ALIVE_TIME_OUT,
    HEADERS_TIME_OUT,
    IMMEDIATE_LOG_FORMAT,
    LOG_FORMAT,
    TOKEN_SECRET,
    TENANT,
    TOKEN_EXPIRATION,
    ALGORITHM,
    ISSUER,
    USER_SERVICE_PORT
};