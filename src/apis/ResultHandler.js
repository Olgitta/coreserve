'use strict';

const { StatusCodes } = require('http-status-codes');
const ResponseBuilder = require("#apis/ResponseBuilder.js");
const context = require("#core/execution-context/context.js");

class ResultHandler {
    static #instance;

    constructor() {
        if (new.target === ResultHandler) {
            throw new Error('ResultHandler is a singleton. Use ResultHandler.getInstance() to access the instance.');
        }
    }

    static getInstance() {
        if (!ResultHandler.#instance) {
            ResultHandler.#instance = this;
        }
        return ResultHandler.#instance;
    }

    /**
     *
     * @param result
     * @param result.statusCode
     * @param result.resources
     * @param result.message
     * @param result.error
     * @param result.pagination
     * @returns {*}
     */
    static handle(result) {
        const {
            statusCode,
            resources,
            message,
            error,
            pagination
        } = result;

        const builder = new ResponseBuilder();

        builder
            .setResources(resources)
            .setMessage(message)
            .setPagination(pagination)
            .setError(error)
            .setTraceId(context.getTraceId());

        return builder.build();
    }

}

module.exports = ResultHandler;
