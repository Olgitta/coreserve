'use strict';

const {StatusCodes} = require('http-status-codes');
const {ApiError, ValidationError, ApiErrorCodes} = require("../core/errors");

class ErrorHandler {
    static #instance;

    constructor() {
        if (new.target === ErrorHandler) {
        // if (!ErrorHandler.#instance) {
            throw new Error('ErrorHandler is a singleton. Use ErrorHandler.getInstance() to access the instance.');
        }
    }

    /**
     * Get the singleton instance of the ErrorHandler class
     * @returns {ErrorHandler} Singleton instance
     */
    static getInstance() {
        if (!ErrorHandler.#instance) {
            ErrorHandler.#instance = this;// new ErrorHandler();
        }
        return ErrorHandler.#instance;
    }

    /**
     *
     * @param err
     * @param statusCode
     * @returns {{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}}
     */
    static handleError(err, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {

        if (err instanceof ValidationError) {
            statusCode = StatusCodes.BAD_REQUEST;
        }

        if (process.env.NODE_ENV === 'production') {
            return {
                statusCode: statusCode,
                error: new ApiError('Something went wrong, try again later...', ApiErrorCodes.GENERAL_ERROR),
            };
        }

        return {
            statusCode: statusCode,
            error: err,
        };
    }
}

module.exports = ErrorHandler;