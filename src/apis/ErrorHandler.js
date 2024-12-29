'use strict';

const {StatusCodes} = require('http-status-codes');
const {ApiError, ValidationError, PaginationError} = require('../core/errors');

class ErrorHandler {
    static #instance;

    constructor() {
        if (new.target === ErrorHandler) {
            throw new Error('ErrorHandler is a singleton. Use ErrorHandler.getInstance() to access the instance.');
        }
    }

    static getInstance() {
        if (!ErrorHandler.#instance) {
            ErrorHandler.#instance = this;
        }
        return ErrorHandler.#instance;
    }

    /**
     *
     * @param err
     * @param statusCode
     * @returns {{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}}
     */
    static handle(err, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {

        if (err instanceof ValidationError) {
            statusCode = StatusCodes.BAD_REQUEST;
        }

        if (err instanceof PaginationError) {
            statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        }

        if (process.env.NODE_ENV === 'production') {
            return {
                statusCode: statusCode,
                error: new ApiError('Something went wrong, try again later...'),
            };
        }

        return {
            statusCode: statusCode,
            error: err,
        };
    }
}

module.exports = ErrorHandler;
