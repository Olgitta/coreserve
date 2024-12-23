'use strict';

module.exports.ErrorCodes = {
    API_BAD_REQUEST: 100,
    UNPROCESSABLE_OPERATION:1000,
}

class ApiError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

module.exports.ApiError = ApiError;