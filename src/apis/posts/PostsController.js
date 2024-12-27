'use strict';

const {StatusCodes} = require('http-status-codes');
const crud = require('./crud');
const logger = require('#core/logger/index.js')('PostsController');
const debug = require('debug')('coreserve:PostsController');
const context = require('#core/execution-context/context.js');
const getConfiguration = require('#config/configuration.js');
const Validator = require('#core/utils/Validator.js');
const {ValidationError, ApiErrorCodes} = require('#core/errors/index.js');
const {PaginationBuilder, ErrorHandler, SuccessHandler} = require('#apis/index.js');
const {ResponseMessages} = require("#apis/consts/index.js");

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
                throw new ValidationError('Failed to create post due to invalid input. Ensure title and content are valid strings.', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await crud.createPost({userId, title, content});
            return SuccessHandler.handle(
                StatusCodes.CREATED,
                result,
                ResponseMessages.RESOURCE_CREATED
            );
        } catch (err) {
            logger.error('An error occurred during post creation.', err);
            return ErrorHandler.handle(err);
        }
    }

    static async getAll(request) {
        debug('getAll called with:', request);
        try {
            const config = getConfiguration().posts;
            const {page = 1, limit = config.pagination.limit} = request;
            const paginationBuilder = new PaginationBuilder(page, limit);
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
            logger.error('Failed to fetch posts due to an unexpected error.', err);
            return ErrorHandler.handle(err);
        }
    }

    static async getById(request) {
        debug('getById called with:', request);
        try {
            const {id} = request;
            const idNumber = Number(id);
            const {userId} = context.getUser();
            const errors = new Validator()
                .isValidNumber(idNumber, 'id')
                .validate();

            if (errors) {
                throw new ValidationError('Invalid input for fetching post by ID. Ensure the ID is a valid number.', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await crud.getPostById({id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, result || {}, ResponseMessages.RESOURCE_FETCHED);
        } catch (err) {
            logger.error('An error occurred while fetching post by ID.', err);
            return ErrorHandler.handle(err);
        }
    }

    static async remove(request) {
        debug('remove called with:', request);
        try {
            const {id} = request;
            const idNumber = Number(id);
            const {userId} = context.getUser();
            const errors = new Validator()
                .isValidNumber(idNumber, 'id')
                .validate();

            if (errors) {
                throw new ValidationError('Failed to remove post due to invalid input. Ensure the ID is a valid number.', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const {deleted, post} = await crud.deletePost({id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, post, `${ResponseMessages.RESOURCE_DELETED}:${deleted}`);
        } catch (err) {
            logger.error('An error occurred while trying to remove the post.', err);
            return ErrorHandler.handle(err);
        }
    }

    static async update(request) {
        debug('update called with:', request);
        try {
            const {id, title, content} = request;
            const {userId} = context.getUser();
            const idNumber = Number(id);
            const errors = new Validator()
                .isValidNumber(idNumber, 'id')
                .isNonEmptyString(title, 'title')
                .isNonEmptyString(content, 'content')
                .validate();

            if (errors) {
                throw new ValidationError('Invalid input for updating the post. Ensure all fields are correctly formatted.', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const {updated, post} = await crud.updatePost({title, content}, {id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, post, `${ResponseMessages.RESOURCE_UPDATED}:${updated}`);
        } catch (err) {
            logger.error('An error occurred during the update operation for the post.', err);
            return ErrorHandler.handle(err);
        }
    }

    static async likeUnlike(request) {
        debug('likeUnlike called with:', request);
        try {
            const {id, op} = request;
            const idNumber = Number(id);
            const {userId} = context.getUser();
            const errors = new Validator()
                .isValidNumber(idNumber, 'id')
                .validate();

            if (errors) {
                throw new ValidationError('Failed to process like/unlike operation due to invalid input. Ensure the ID is valid.', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await crud.updateLikes({like: op}, {id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, {}, `${ResponseMessages.RESOURCE_PROCEEDED}:${result}`);
        } catch (err) {
            logger.error('An error occurred while processing like/unlike operation.', err);
            return ErrorHandler.handle(err);
        }
    }
}

module.exports = PostsController;

