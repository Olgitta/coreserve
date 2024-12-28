'use strict';

const Joi = require('joi');
const debug = require('debug')('coreserve:PaginationBuilder');
const {PaginationError} = require('#core/errors/index.js');
const {updateQueryParams} = require('#core/utils/urlUtils.js');

const builderSchema = Joi.object({
    url: Joi.string().required(),
    total: Joi.number().required(),
    limit: Joi.number().required(),
    page: Joi.number().required(),
});

class PaginationBuilder {

    #dataset
    #page;
    #limit;
    #skip;
    #total;
    #url;

    /**
     *
     * @param page
     * @param limit
     */
    constructor(page, limit) {
        this.#dataset = {};
        this.#page = page;
        this.#limit = limit;
        this.#skip = (this.#page - 1) * this.#limit;
    }

    get skip() {
        return this.#skip;
    }

    get limit() {
        return this.#limit;
    }

    setTotal(total) {
        this.#total = total;
        return this;
    }

    setUrl(url) {
        this.#url = url;
        return this;
    }

    /**
     *
     * @returns {{total, totalPages: number}}
     */
    build() {

        this.#dataset = {
            url: this.#url,
            total: this.#total,
            limit: this.#limit,
            page: this.#page,
        };

        const {error} = builderSchema.validate(this.#dataset);
        if (error) {
            throw new PaginationError('PaginationBuilder: build failed.', {
                error, dataset: {
                    url: this.#url,
                    total: this.#total,
                    limit: this.#limit,
                    page: this.#page,
                }
            });
        }

        debug('going to build pagination from:', this.#dataset);
        const {total, limit, page, url} = this.#dataset;
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        const result = {
            total,
            totalPages,
        };

        if (hasNextPage) {
            result.nextPage = updateQueryParams(url, {
                page: page + 1,
                limit
            });
        }

        if (hasPrevPage) {
            result.prevPage = updateQueryParams(url, {
                page: page - 1,
                limit
            });
        }

        debug('built successfully:', result);

        return result;
    }
}

module.exports = PaginationBuilder;
