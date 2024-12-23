'use strict';

const {StatusCodes} = require('http-status-codes');
const {
    createComment,
    deleteComment,
    getCommentById,
    getCommentsWithPagination,
    updateLikes
} = require('./crud');
const log = require('../../core/logger')('CommentsController');
const debug = require('debug')('coreserve:CommentsController');
const {getCtx} = require('../../core/execution-context/context');
const getConfiguration = require('../../config/configuration');
const {PaginationBuilder, normalizePaginationParams} = require('../pagination');
const {ApiError, ErrorCodes} = require('../../core/errors');
const Validator = require('../../core/utils/Validator');

module.exports = {
    create,
    getAll,
    getById,
    remove,
    like,
    unlike
};

async function create(reqBody = {}) {
    try {
        const {postId, parentId, content} = reqBody;
        const poi = Number(postId);
        let pai = Number(parentId);
        if(parentId === null || parentId === undefined) {
            // valid parentId for first level comment
            pai = null;
        }

        const {errors} = new Validator()
            .isValidNumber(poi)
            .isValidNumberOrNull(pai)
            .isNonEmptyString(content)
            .validate();

        if (errors) {
            log.error(`create:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await createComment({postId: poi, content, parentId:pai});
        return {statusCode: StatusCodes.CREATED, resources: result};
    } catch (err) {
        log.error('create:error', err);
        if (err instanceof ApiError && err.code === ErrorCodes.API_BAD_REQUEST) {
            return handleError(err, StatusCodes.BAD_REQUEST);
        }
        return handleError(err);
    }
}

async function getAll(requestQuery) {
    try {
        const ctx = getCtx();
        const config = getConfiguration().comments;
        debug('getAll config', config);
        const {page, limit} = normalizePaginationParams(requestQuery.page, requestQuery.limit, config);

        const {postId, parentId} = requestQuery;
        const poi = Number(postId);
        let pai = Number(parentId);
        if(parentId === null || parentId === undefined) {
            // valid parentId for first level comment
            pai = null;
        }

        const {errors} = new Validator()
            .isValidNumber(poi)
            .isValidNumberOrNull(pai)
            .validate();

        if (errors) {
            log.error(`getAll:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const skip = (page - 1) * limit;
        const {comments, total} = await getCommentsWithPagination(poi, pai, skip, limit);
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
            resources: comments,
            pagination: {
                nextPage,
                prevPage,
                totalPages
            }
        };
    } catch (err) {
        log.error('getAll:error', err);
        return handleError(err);
    }
}

async function getById(id) {
    try {
        const parsedId = Number(id);

        const {errors} = new Validator()
            .isValidNumber(parsedId)
            .validate();

        if (errors) {
            log.error(`getById:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await getCommentById(parsedId);
        if (result === null) {
            log.error('getById:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`getById:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function remove(id) {
    try {
        const parsedId = Number(id);

        const {errors} = new Validator()
            .isValidNumber(parsedId)
            .validate();

        if (errors) {
            log.error(`remove:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await deleteComment(parsedId);
        if (result === null) {
            log.error('remove:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`remove:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function like(id) {
    try {
        const parsedId = Number(id);

        const {errors} = new Validator()
            .isValidNumber(parsedId)
            .validate();

        if (errors) {
            log.error(`like:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await updateLikes(parsedId, true);

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error('like:error', err);
        return handleError(err);
    }
}

async function unlike(id) {
    try {
        const parsedId = Number(id);

        const {errors} = new Validator()
            .isValidNumber(parsedId)
            .validate();

        if (errors) {
            log.error(`unlike:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await updateLikes(parsedId, false);

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error('unlike:error', err);
        return handleError(err);
    }
}

function handleError(err, statusCode) {

    return {
        statusCode: statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        reason: err.message,
        error: err
    };
}
