const httpContext = require("express-http-context");
const { decode, verify } = require("jsonwebtoken");
const { appendExceptionStack } = require("../utils/exceptionUtils");
const {
  AUTHORIZATION_CONTEXT_KEY,
  BASE_URL,
  USER_DETAILS_CONTEXT_KEY,
} = require("../constants/configConstants");
const UnauthorizedException = require("../exceptions/UnauthorizedException");

const unsecuredEndpoints = {
  [`${BASE_URL}/auth/login`]: { method: "POST" },
  [`${BASE_URL}/auth/register`]: { method: "POST" },
  [`${BASE_URL}/health`]: { method: "GET" },
};

const isUnsecuredEndpoint = (originalUrl, method) =>
  Object.prototype.hasOwnProperty.call(unsecuredEndpoints, originalUrl) &&
  method === unsecuredEndpoints[originalUrl].method;

const tokenHandler = () => {
  return async (req, res, next) => {
    if (isUnsecuredEndpoint(req.originalUrl, req.method)) {
      return next();
    }
    const authorizationToken = req.headers.authorization;

    if (!authorizationToken) {
      return next(
        new UnauthorizedException("Authorization token missing from the header")
      );
    }
    try {
      // const decoded = verify(authorizationToken, getPublicKey(), { algorithms: [ALGORITHM], issuer: ISSUER });
      const decoded = decode(authorizationToken);
      const { user, tenant } = decoded;
      httpContext.set(USER_DETAILS_CONTEXT_KEY, { user, tenant });
      httpContext.set(AUTHORIZATION_CONTEXT_KEY, authorizationToken);
      return next();
    } catch (error) {
      if (
        error.name &&
        ["JsonWebTokenError", "NotBeforeError", "TokenExpiredError"].includes(
          error.name
        )
      ) {
        return next(new UnauthorizedException(error.message));
      }
      return next(appendExceptionStack(error));
    }
  };
};

module.exports = tokenHandler;
