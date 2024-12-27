'use strict';
//todo: remove
module.exports.ApiErrorCodes = {
    GENERAL_ERROR: 'general_error',
    BAD_REQUEST: 'bad_request',
}

class ApiError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
    }

    toJSON() {
        return {
            message: this.message,
            code: this.code,
            details: this.details,
        };
    }
}

//todo: delete ValidationError and use ApiError with StatusCodes
class ValidationError extends ApiError {
    /**
     *
     * @param message
     * @param code
     * @param details
     */
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
    }
}

module.exports.ApiError = ApiError;
module.exports.ValidationError = ValidationError;