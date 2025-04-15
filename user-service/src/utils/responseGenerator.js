const createResponse = (status, message = null, data = null) => {
    return { status, message, data };
};

const createSuccessResponse = (data, message) => {
    if (data === undefined) throw new Error('"data" must be defined when calling createSuccessResponse.');
    return {
        status: 'success',
        message,
        data: data && data.data ? data.data : data
    };
};

const createErrorResponse = (error, message, data) => {
    const json = {
        status: 'error'
    };

    if (message) {
        json.message = message;
    } else {
        json.message = error.message || 'Internal server error';
    }

    if (data) {
        json.data = data;
    }

    return json;
};

const createFailResponse = (data) => {
    if (data === undefined) throw new Error('"data" must be defined when calling createFailResponse');
    return {
        status: 'fail',
        data
    };
};

module.exports = {
    createResponse,
    createSuccessResponse,
    createErrorResponse,
    createFailResponse
}
