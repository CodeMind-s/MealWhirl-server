const httpContext = require('express-http-context');
const {
    AUTHORIZATION_CONTEXT_KEY,
    CORRELATION_ID_CONTEXT_KEY,
    DB_SCHEMA_SUFFIX,
    USER_DETAILS_CONTEXT_KEY
} = require('../constants/configConstants');

/**
 * Retrieves the user details context from the HTTP context.
 * @returns {{user: {id: string, roleId: string, role: string, tenant: {dbIdentifier: string, tenantIdentifier: string}}}} The user details context.
 */
function getUserDetailsContext() {
    return httpContext.get(USER_DETAILS_CONTEXT_KEY);
}

/**
 * Retrieves the role ID of the user from the context.
 * @returns {string|undefined} The user's role ID.
 */
function getUserRoleId() {
    const {user} = getUserDetailsContext();
    return user.roleId;
}

/**
 * Retrieves the user ID from the context.
 * @returns {string|undefined} The user's ID.
 */
function getUserId() {
    const {user} = getUserDetailsContext();
    return user.id;
}

/**
 * Retrieves the role of the user from the context.
 * @returns {string|undefined} The user's role.
 */
function getUserRole() {
    const {user} = getUserDetailsContext();
    return user.role;
}

/**
 * Retrieves the tenant information of the user from the context.
 * @returns {Object|undefined} The tenant information.
 */
function getUserTenant() {
    return getUserDetailsContext().tenant;
}

/**
 * Retrieves the authorization token from the HTTP context.
 * @returns {string|undefined} The authorization token.
 */
function getAuthorizationToken() {
    return httpContext.get(AUTHORIZATION_CONTEXT_KEY);
}

/**
 * Retrieves the correlation ID from the HTTP context.
 * @returns {string|undefined} The correlation ID.
 */
function getCorrelationId() {
    return httpContext.get(CORRELATION_ID_CONTEXT_KEY);
}

/**
 * Retrieves the database identifier from the tenant information.
 * @returns {string|undefined} The database identifier.
 */
function getDbIdentifier() {
    const {dbIdentifier} = getUserTenant() || {};
    return dbIdentifier;
}

/**
 * Retrieves the schema name from the tenant information.
 * @returns {string} The schema name.
 */
function getSchemaName() {
    const {tenantIdentifier} = getUserTenant() || {};
    return `${tenantIdentifier}${DB_SCHEMA_SUFFIX}`;
}

module.exports = {
    getUserRoleId,
    getUserId,
    getUserRole,
    getUserTenant,
    getAuthorizationToken,
    getCorrelationId,
    getDbIdentifier,
    getSchemaName
}