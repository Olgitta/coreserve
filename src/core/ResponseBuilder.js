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
        if (process.env.NODE_ENV !== 'production') {
            this.response.metadata.error = error;
        }

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
     * @param totalPages
     * @param nextPage
     * @param prevPage
     * @returns {ResponseBuilder}
     */
    setPagination(totalPages, nextPage, prevPage) {

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