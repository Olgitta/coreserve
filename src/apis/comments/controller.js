'use strict';

const {StatusCodes} = require('http-status-codes');
const {
    createComment,
    deleteComment,
    getCommentsWithPagination,
    updateLikes
} = require('./crud');
const logger = require('#core/logger/index.js')('CommentsController');
const debug = require('debug')('coreserve:CommentsController');
const {getCtx} = require('../../core/execution-context/context');
const getConfiguration = require('../../config/configuration');
const PaginationBuilder = require('../PaginationBuilder');
const {ApiError, ApiErrorCodes, ValidationError} = require('#core/errors/index.js');
const Validator = require('../../core/utils/Validator');
const context = require('../../core/execution-context/context');
const SuccessHandler = require('../SuccessHandler');
const ErrorHandler = require('../ErrorHandler');

module.exports = {
    create,
    getAll,
    remove,
    likeUnlike
};

/**
 *
 * @param request
 * @param request.postId
 * @param request.parentId {optional}
 * @param request.content
 * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
 */
async function create(request) {
    debug('create called with:', request);
    try {
        const {postId, parentId, content} = request;
        const {userId} = context.getUser();
        const poi = Number(postId);
        let pai = Number(parentId);
        if (parentId === null || parentId === undefined) {
            // valid parentId for first level comment
            pai = null;
        }

        const errors = new Validator()
            .isValidNumber(poi, 'postId')
            .isValidNumberOrNull(pai, 'parentId')
            .isNonEmptyString(content, 'content')
            .validate();

        if (errors !== null) {
            throw new ValidationError('Invalid input on comment creation', ApiErrorCodes.BAD_REQUEST, errors);
        }

        const result = await createComment({postId: poi, parentId: pai, userId, content});
        return SuccessHandler.handle(
            StatusCodes.CREATED,
            result,
            'created'
        );
    } catch (err) {
        logger.error('Error on comment creation', err);
        return ErrorHandler.handleError(err);
    }
}

/**
 *
 * @param request
 * @param request.postId
 * @param request.parentId {optional}
 * @param request.page {optional}
 * @param request.limit {optional}
 * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|*>}
 */
async function getAll(request) {
    debug('getAll called with:', request);
    try {
        const ctx = getCtx();
        const config = getConfiguration().comments;
        const {page = 1, limit = config.pagination.limit} = request;

        const paginationBuilder = new PaginationBuilder(page, limit);

        const {userId} = context.getUser();
        const {postId, parentId} = request;
        const poi = Number(postId);
        let pai = Number(parentId);
        if (parentId === null || parentId === undefined) {
            // valid parentId for first level comment
            pai = null;
        }

        const errors = new Validator()
            .isValidNumber(poi, 'postId')
            .isValidNumberOrNull(pai, 'parentId')
            .validate();

        if (errors !== null) {
            throw new ValidationError('Invalid input on get all comments', ApiErrorCodes.BAD_REQUEST, errors);
        }

        const {comments, total} = await getCommentsWithPagination(poi, pai, userId, paginationBuilder.skip, paginationBuilder.limit);
        const cleanUrl = ctx?.request?.url.split('?')[0];

        paginationBuilder
            .setUrl(cleanUrl)
            .setTotal(total);

        return SuccessHandler.handleWithPagination(
            StatusCodes.OK,
            comments,
            'proceeded',
            paginationBuilder.build());
    } catch (err) {
        logger.error('Error on get all comments', err);
        return ErrorHandler.handleError(err);
    }
}

/**
 *
 * @param request
 * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
 */
async function remove(request) {
    debug('remove called with:', request);
    try {
        const {id} = request;
        const coi = Number(id);
        const {userId} = context.getUser();
        const errors = new Validator()
            .isValidNumber(coi, 'id')
            .validate();

        if (errors) {
            throw new ValidationError('Invalid input on remove comment', ApiErrorCodes.BAD_REQUEST);
        }

        const {deleted, comment} = await deleteComment(coi, userId);

        return SuccessHandler.handle(StatusCodes.OK, comment, `deleted:${deleted}`);
    } catch (err) {
        logger.error('Error on remove comment', err);
        return ErrorHandler.handleError(err);
    }
}

/**
 *
 * @param request
 * @param request.id
 * @param request.op
 * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
 */
async function likeUnlike(request) {
    debug('likeUnlike called with:', request);
    try {
        const {id, op} = request;
        const coi = Number(id);
        const {userId} = context.getUser();
        const errors = new Validator()
            .isValidNumber(coi, 'id')
            .validate();

        if (errors) {
            throw new ValidationError('Invalid input on likeUnlike', ApiErrorCodes.BAD_REQUEST, errors);
        }

        const result = await updateLikes(coi, userId, op);

        return SuccessHandler.handle(StatusCodes.OK, {}, `proceeded:${result}`);
    } catch (err) {
        logger.error('Error on likeUnlike', err);
        return ErrorHandler.handleError(err);
    }
}
