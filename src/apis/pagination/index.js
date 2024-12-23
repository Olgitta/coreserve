'use strict';

const Joi = require('joi');

const builderSchema = Joi.object({
    url: Joi.string().required(),
    total: Joi.number().required(),
    limit: Joi.number().required(),
    page: Joi.number().required(),
});

class PaginationBuilder {

    constructor() {
        this.dataset = {};
    }

    setPage(page) {
        this.dataset.page = page;
        return this;
    }

    setLimit(limit) {
        this.dataset.limit = limit;
        return this;
    }

    setTotal(total) {
        this.dataset.total = total;
        return this;
    }

    setUrl(url) {
        this.dataset.url = url;
        return this;
    }

    build() {

        const {error} = builderSchema.validate(this.dataset);
        if (error) {
            return {};
        }

        const {total, limit, page, url} = this.dataset;
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage
                ? `${url}?page=${page + 1}&limit=${limit}`
                : null,
            prevPage: hasPrevPage
                ? `${url}?page=${page - 1}&limit=${limit}`
                : null,
        };
    }
}

module.exports.PaginationBuilder = PaginationBuilder;

module.exports.normalizePaginationParams = function (page, limit, config) {
    const p = Number.parseInt(page);
    const l = Number.parseInt(limit);
    return {
        page: Number.isNaN(p) || p < 1 ? 1 : p,
        limit: Number.isNaN(l) || l < 1 ? config.pagination.limit : l,
    };
}