const { GENERAL_EXCEPTION } = require('../exceptions/exceptionCodes');
const logger = require('../utils/logger');

const errorLogger =() => {
  return (err, req, res, next) => {
    const errorCode = err.errorCode || GENERAL_EXCEPTION;
    const { code, message, stack, address, dest, errno, info, path, port, syscall, errorDetails } = err;
    logger.error({
      code,
      message,
      stack,
      address,
      dest,
      errno,
      info,
      path,
      port,
      syscall,
      errorDetails,
      errorCode
    });
    next(err);
  };
}

module.exports = errorLogger;
