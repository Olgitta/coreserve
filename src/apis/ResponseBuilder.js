'use strict';

class ResponseBuilder {
    constructor() {
        this.response = {
            metadata: {
                traceId: '',
            },
        };
    }

    /**
     *
     * @param id
     * @returns {ResponseBuilder}
     */
    setTraceId(id) {
        this.response.metadata.traceId = id;
        return this;
    }

    /**
     *
     * @param error
     * @returns {ResponseBuilder}
     */
    setError(error) {
        if (!error) {
            return this;
        }

        this.response.metadata.error = error;

        return this;
    }

    /**
     *
     * @param resources
     * @returns {ResponseBuilder}
     */
    setResources(resources) {
        if (resources !== null && resources !== undefined) {
            this.response.resources = resources;
        }
        return this;
    }

    /**
     *
     * @param pagination
     * @param pagination.totalPages
     * @param pagination.prevPage
     * @param pagination.nextPage
     * @returns {ResponseBuilder}
     */
    setPagination(pagination) {

        if(!pagination) {
            return this;
        }

        const {totalPages, nextPage, prevPage} = pagination;

        this.response.pagination = {
            totalPages,
            ...(prevPage && {prevPage}),
            ...(nextPage && {nextPage}),
        };

        return this;
    }

    /**
     *
     * @param message
     * @returns {ResponseBuilder}
     */
    setMessage(message) {
        this.response.metadata.message = message;
        return this;
    }

    /**
     * Build the response object
     * @returns {object}
     */
    build() {
        return this.response;
    }

}

module.exports = ResponseBuilder;