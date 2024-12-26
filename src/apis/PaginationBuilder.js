'use strict';

const Joi = require('joi');
const debug = require('debug')('coreserve:PaginationBuilder');
const Validator = require('#core/utils/Validator.js');
const {ValidationError, ApiErrorCodes} = require('#core/errors/index.js');

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
        this.#page = Number(page);
        this.#limit = Number(limit);

        const errors = new Validator()
            .isValidNumber(this.#page, 'page')
            .isValidNumber(this.#limit, 'limit')
            .validate();

        if (errors !== null) {
            throw new ValidationError('Invalid input on PaginationBuilder initializing', ApiErrorCodes.BAD_REQUEST, errors);
        }

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
            throw new ValidationError('Failed on PaginationBuilder build', ApiErrorCodes.BAD_REQUEST, error);
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

        if(hasNextPage) {
            result.nextPage = `${url}?page=${page + 1}&limit=${limit}`;
        }

        if (hasPrevPage) {
            result.prevPage = `${url}?page=${page - 1}&limit=${limit}`;
        }

        debug('built successfully:', result);

        return result;
    }
}

module.exports = PaginationBuilder;
