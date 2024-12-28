'use strict';

const {StatusCodes} = require('http-status-codes');
const crud = require('./crud');
const logger = require('#core/logger/index.js')('PostsController');
const debug = require('debug')('coreserve:PostsController');
const context = require('#core/execution-context/context.js');
const getConfiguration = require('#config/configuration.js');
const Validator = require('#core/utils/Validator.js');
const {PaginationBuilder, ErrorHandler, SuccessHandler} = require('#apis/index.js');
const {ResponseMessages} = require('#apis/consts/index.js');

class PostsController {
    static #instance;

    constructor() {
        if (new.target === PostsController) {
            throw new Error('PostsController is a singleton class. Please use PostsController.getInstance() to access the instance.');
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
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async create(request) {
        debug('create called with:', request);
        try {
            const {title, content} = request;
            const {userId} = context.getUser();
            new Validator()
                .isNonEmptyString(title, 'title')
                .isNonEmptyString(content, 'content')
                .validate();

            const result = await crud.createPost({userId, title, content});
            return SuccessHandler.handle(
                StatusCodes.CREATED,
                result,
                ResponseMessages.RESOURCE_CREATED
            );
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.page
     * @param request.limit
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|*>}
     */
    static async getAll(request) {
        debug('getAll called with:', request);
        try {
            const config = getConfiguration().posts;
            const {page = 1, limit = config.pagination.limit} = request;
            const pageNumber = Number(page);
            const limitNumber = Number(limit);

            new Validator()
                .isValidNumber(pageNumber, 'page')
                .isValidNumber(limitNumber, 'limit')
                .validate();

            const paginationBuilder = new PaginationBuilder(pageNumber, limitNumber);
            const {userId} = context.getUser();

            const {posts, total} = await crud.getPosts({
                    skip: paginationBuilder.skip,
                    limit: paginationBuilder.limit
                },
                {userId});

            paginationBuilder
                .setUrl(context.getRequestUrl())
                .setTotal(total);

            return SuccessHandler.handleWithPagination(
                StatusCodes.OK,
                posts,
                ResponseMessages.RESOURCE_FETCHED,
                paginationBuilder.build());
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async getById(request) {
        debug('getById called with:', request);
        try {
            const {id} = request;
            const idNumber = Number(id);
            const {userId} = context.getUser();

            new Validator()
                .isValidNumber(idNumber, 'id')
                .validate();

            const result = await crud.getPostById({id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, result || {}, ResponseMessages.RESOURCE_FETCHED);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async remove(request) {
        debug('remove called with:', request);
        try {
            const {id} = request;
            const idNumber = Number(id);
            const {userId} = context.getUser();

            new Validator()
                .isValidNumber(idNumber, 'id')
                .validate();

            const {deleted, post} = await crud.deletePost({id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, post, `${ResponseMessages.RESOURCE_DELETED}:${deleted}`);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @param request.title
     * @param request.content
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async update(request) {
        debug('update called with:', request);
        try {
            const {id, title, content} = request;
            const {userId} = context.getUser();
            const idNumber = Number(id);

            new Validator()
                .isValidNumber(idNumber, 'id')
                .isNonEmptyString(title, 'title')
                .isNonEmptyString(content, 'content')
                .validate();

            const {updated, post} = await crud.updatePost({title, content}, {id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, post, `${ResponseMessages.RESOURCE_UPDATED}:${updated}`);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @param request.op
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async likeUnlike(request) {
        debug('likeUnlike called with:', request);
        try {
            const {id, op} = request;
            const idNumber = Number(id);
            const {userId} = context.getUser();

            new Validator()
                .isValidNumber(idNumber, 'id')
                .validate();

            const result = await crud.updateLikes({like: op}, {id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, {}, `${ResponseMessages.RESOURCE_PROCEEDED}:${result}`);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }
}

module.exports = PostsController;

