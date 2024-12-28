'use strict';

const { StatusCodes } = require('http-status-codes');

class SuccessHandler {
    static #instance;

    constructor() {
        if (new.target === SuccessHandler) {
            throw new Error('SuccessHandler is a singleton. Use SuccessHandler.getInstance() to access the instance.');
        }
    }

    static getInstance() {
        if (!SuccessHandler.#instance) {
            SuccessHandler.#instance = this;
        }
        return SuccessHandler.#instance;
    }

    /**
     *
     * @param statusCode
     * @param resources
     * @param message
     * @returns {{statusCode: StatusCodes.OK, resources, message}}
     */
    static handle(statusCode, resources, message) {
        // todo: message should from some const ApiMessages

        return {
            statusCode: statusCode || StatusCodes.OK,
            resources,
            message,
        };
    }

    /**
     *
     * @param statusCode
     * @param result
     * @param message
     * @param pagination
     * @returns {*&{pagination}}
     */
    static handleWithPagination(statusCode, result, message, pagination) {
        return {
            ...this.handle(statusCode, result, message),
            pagination,
        };
    }
}

module.exports = SuccessHandler;
