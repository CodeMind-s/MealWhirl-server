const { getUserId, getUserRole } = require ('../utils/contextUtils');
const { PERMISSION_TYPES } = require ('../constants/permissionConstants');
const ForbiddenException = require ('../exceptions/ForbiddenException');

/**
 * Middleware to handle authorization based on user roles and ownership.
 *
 * @param {Array<string>} permittedRoles - List of roles permitted to access the route.
 * @param {Function|null} [getOwner=null] - Function to get the owner ID from input parameters.
 * @param {Function|null} [inputFormatter=null] - Function to format input parameters.
 * @param {Function|null} [outputFormatter=null] - Function to format the owner ID.
 * @returns {Function} Middleware function for Express.
 */
function authorization(permittedRoles, getOwner = null, inputFormatter = null, outputFormatter = null) {
    return async (req, res, next) => {
        const userRole = getUserRole();

        if (userRole) {
            if (permittedRoles.includes(PERMISSION_TYPES.ANY) || permittedRoles.includes(userRole)) {
                return next();
            }
            if (permittedRoles.includes(PERMISSION_TYPES.OWNER)) {
                const userId = getUserId();
                let inputParameters = { ...req.body, ...req.params, ...req.query };
                if (inputFormatter) {
                    inputParameters = inputFormatter(inputParameters);
                }
                let ownerId = await getOwner(inputParameters);

                if (outputFormatter) {
                    ownerId = outputFormatter(ownerId);
                }
                if (userId === ownerId) {
                    return next();
                }
            }
        }
        return next(
            new ForbiddenException(
                `User with role ${userRole} is not authorized to perform this action. Permissions required: ${permittedRoles}`
            )
        );
    };
}

module.exports = authorization;
