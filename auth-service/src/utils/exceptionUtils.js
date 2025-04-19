const logger = require('./logger');

const GENERAL_EXCEPTION = 4000;

const appendExceptionStack = (error) => {
    if (error instanceof Error) {
        const { stack } = new Error('exceptionStack');
        error.stack += `\nCaused By:\n${stack}`;
        return error;
    }
    return new Error(error);
}

const exceptionLogger = (error) => {
    const errorCode = error.errorCode || GENERAL_EXCEPTION;
    const { code, message, stack, address, dest, errno, info, path, port, syscall, errorDetails } = error;
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
}

module.exports = {
    appendExceptionStack,
    exceptionLogger
}