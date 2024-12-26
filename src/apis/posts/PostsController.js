'use strict';

const {StatusCodes} = require('http-status-codes');
const {createPost, deletePost, getPostsWithPagination, getPostById, updatePost, updateLikes} = require('./crud');
const logger = require('#core/logger/index.js')('PostsController');
const debug = require('debug')('coreserve:PostsController');
const context = require('#core/execution-context/context.js');
const getConfiguration = require('#config/configuration.js');
const Validator = require('#core/utils/Validator.js');
const {ValidationError, ApiErrorCodes} = require('#core/errors/index.js');
const {PaginationBuilder, ErrorHandler, SuccessHandler} = require('#apis/index.js');

class PostsController {
    static #instance;

    constructor() {
        if (new.target === PostsController) {
            throw new Error('PostsController is a singleton. Use PostsController.getInstance() to access the instance.');
        }
    }

    static getInstance() {
        if (!PostsController.#instance) {
            PostsController.#instance = this;
        }
        return PostsController.#instance;
    }

    /**
     *
     * @param request
     * @param request.title
     * @param request.content
     * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async create(request) {
        debug('create called with:', request);
        try {
            const {title, content} = request;
            const {userId} = context.getUser();
            const errors = new Validator()
                .isNonEmptyString(title, 'title')
                .isNonEmptyString(content, 'content')
                .validate();

            if (errors !== null) {
                throw new ValidationError('Invalid input on post creation', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await createPost({userId, title, content});
            return SuccessHandler.handle(
                StatusCodes.CREATED,
                result,
                'created'
            );
        } catch (err) {
            logger.error('Error on post creation', err);
            return ErrorHandler.handleError(err);
        }
    }

    /**
     *
     * @param request
     * @param request.page {optional}
     * @param request.limit {optional}
     * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|*>}
     */
    static async getAll(request) {
        debug('getAll called with:', request);
        try {
            const ctx = context.getCtx();
            const config = getConfiguration().posts;
            const {page = 1, limit = config.pagination.limit} = request;
            const paginationBuilder = new PaginationBuilder(page, limit);
            const {userId} = context.getUser();

            const {posts, total} = await getPostsWithPagination(userId, paginationBuilder.skip, paginationBuilder.limit);
            const cleanUrl = ctx?.request?.url.split('?')[0];

            paginationBuilder
                .setUrl(cleanUrl)
                .setTotal(total);

            return SuccessHandler.handleWithPagination(
                StatusCodes.OK,
                posts,
                'proceeded',
                paginationBuilder.build());
        } catch (err) {
            logger.error('Error on get all posts', err);
            return ErrorHandler.handleError(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async getById(request) {
        debug('getById called with:', request);
        try {
            const {id} = request;
            const poi = Number(id);
            const {userId} = context.getUser();
            const errors = new Validator()
                .isValidNumber(poi, 'id')
                .validate();

            if (errors) {
                throw new ValidationError('Invalid input on get post by Id', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await getPostById(poi, userId);

            return SuccessHandler.handle(StatusCodes.OK, result || {}, 'proceeded');
        } catch (err) {
            logger.error('Error on get post by id', err);
            return ErrorHandler.handleError(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @returns {Promise<{statusCode: StatusCodes.NOT_FOUND}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, reason, error}|{statusCode: StatusCodes.BAD_REQUEST}|{statusCode: StatusCodes.OK, resources}>}
     */
    static async remove(request) {
        debug('remove called with:', request);
        try {
            const {id} = request;
            const poi = Number(id);
            const {userId} = context.getUser();
            const errors = new Validator()
                .isValidNumber(poi, 'id')
                .validate();

            if (errors) {
                throw new ValidationError('Invalid input on remove post', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const {deleted, post} = await deletePost(poi, userId);

            return SuccessHandler.handle(StatusCodes.OK, post, `deleted:${deleted}`);
        } catch (err) {
            logger.error('Error on remove post by id', err);
            return ErrorHandler.handleError(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @param request.title
     * @param request.content * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async update(request) {
        debug('update called with:', request);
        try {
            const {id, title, content} = request;
            const {userId} = context.getUser();
            const poi = Number(id);
            const errors = new Validator()
                .isValidNumber(poi, 'id')
                .isNonEmptyString(title, 'title')
                .isNonEmptyString(content, 'content')
                .validate();

            if (errors) {
                throw new ValidationError('Invalid input on update post', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const {updated, post} = await updatePost(poi, userId, {title, content});

            return SuccessHandler.handle(StatusCodes.OK, post, `updated:${updated}`);
        } catch (err) {
            logger.error('Error on update post', err);
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
    static async likeUnlike(request) {
        debug('likeUnlike called with:', request);
        try {
            const {id, op} = request;
            const poi = Number(id);
            const {userId} = context.getUser();
            const errors = new Validator()
                .isValidNumber(poi, 'id')
                .validate();

            if (errors) {
                throw new ValidationError('Invalid input on likeUnlike', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await updateLikes(poi, userId, op);

            return SuccessHandler.handle(StatusCodes.OK, {}, `proceeded:${result}`);
        } catch (err) {
            logger.error('Error on likeUnlike', err);
            return ErrorHandler.handleError(err);
        }
    }

}

module.exports = PostsController;

