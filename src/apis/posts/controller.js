'use strict';

const {StatusCodes} = require('http-status-codes');
const {createPost, deletePost, getPostsWithPagination, getPostById, updatePost, updateLikes} = require('./crud');
const log = require('../../core/logger')('PostsController');
const debug = require('debug')('coreserve:PostsController');
const {getCtx} = require('../../core/execution-context/context');
const getConfiguration = require('../../config/configuration');
const {PaginationBuilder, normalizePaginationParams} = require('../pagination');
const Validator = require("../../core/utils/Validator");

module.exports = {
    create,
    getAll,
    getById,
    remove,
    update,
    like,
    unlike
};

async function create(title, content) {
    try {
        const {success, failed} = new Validator()
            .isNonEmptyString(title)
            .isNonEmptyString(content)
            .validate();

        if (failed) {
            log.error(`create:invalid input:${failed.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await createPost({title, content});
        return {statusCode: StatusCodes.CREATED, resources: result};
    } catch (err) {
        log.error(`create:error`, err);
        return handleError(err);
    }
}

async function getAll(requestQuery) {
    try {
        const ctx = getCtx();
        const config = getConfiguration().posts;
        debug('getAll config', config);
        const {page, limit} = normalizePaginationParams(requestQuery.page, requestQuery.limit, config);
        const skip = (page - 1) * limit;
        const {posts, total} = await getPostsWithPagination(skip, limit);
        const cleanUrl = ctx?.request?.url.split('?')[0];

        const paginationBuilder = new PaginationBuilder();
        paginationBuilder
            .setUrl(cleanUrl)
            .setTotal(total)
            .setLimit(limit)
            .setPage(page);

        const {totalPages, nextPage, prevPage} = paginationBuilder.build();
        debug('pagination', {totalPages, nextPage, prevPage});

        return {
            statusCode: StatusCodes.OK,
            resources: posts,
            pagination: {
                nextPage,
                prevPage,
                totalPages
            }
        };
    } catch (err) {
        log.error(`getAll:error`, err);
        return handleError(err);
    }
}

async function getById(id) {
    try {
        const result = await getPostById(id);
        if (result === null) {
            log.error('getById:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`getById:error`, err);
        return handleError(err);
    }
}

async function remove(id) {
    try {
        const result = await deletePost(id);
        if (result === null) {
            log.error('remove:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`remove:error`, err);
        return handleError(err);
    }
}

async function update(id, data) {
    try {
        const result = await updatePost(id, data);
        if (result === null) {
            log.error('update:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`update:error`, err);
        return handleError(err);
    }
}

async function like(id) {
    try {
        const result = await updateLikes(id, true);

        if (result === null) {
            log.error('like:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`like:error`, err);
        return handleError(err);
    }
}

async function unlike(id) {
    try {
        const result = await updateLikes(id, false);

        if (result === null) {
            log.error('unlike:not found or no changes made.');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`unlike:error`, err);
        return handleError(err);
    }
}

function handleError(err) {

    return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        reason: err.message,
        error: err
    };
}
