'use strict';

const {StatusCodes} = require('http-status-codes');
const crud = require('./crud');
const logger = require('#core/logger/index.js')('CommentsController');
const debug = require('debug')('coreserve:CommentsController');
const {ResponseMessages} = require('../consts');
const getConfiguration = require('#config/configuration.js');
const Validator = require('#core/utils/Validator.js');
const context = require('#core/execution-context/context.js');
const {ErrorHandler, PaginationBuilder, SuccessHandler} = require('#apis/index.js')

class CommentsController {
    static #instance;

    constructor() {
        if (new.target === CommentsController) {
            throw new Error(
                'Initialization Error: CommentsController is a singleton. Use CommentsController.getInstance() to access the instance.'
            );
        }
    }

    static getInstance() {
        if (!CommentsController.#instance) {
            CommentsController.#instance = this;
        }
        return CommentsController.#instance;
    }

    /**
     *
     * @param request
     * @param request.postId
     * @param request.parentId
     * @param request.content
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async create(request) {
        debug('create called with:', request);
        try {
            const {postId, parentId, content} = request;
            const {userId} = context.getUser();

            const postIdNumber = Number(postId);
            let parentIdNumber = Number(parentId);
            if (parentId === null || parentId === undefined) {
                parentIdNumber = null;
            }

            new Validator()
                .isValidNumber(postIdNumber, 'postId')
                .isValidNumberOrNull(parentIdNumber, 'parentId')
                .isNonEmptyString(content, 'content')
                .validate();

            const result = await crud.createComment({postId: postIdNumber, parentId: parentIdNumber, userId, content});
            return SuccessHandler.handle(StatusCodes.CREATED, result, ResponseMessages.RESOURCE_CREATED);
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
     * @param request.postId
     * @param request.parentId
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|*>}
     */
    static async getAll(request) {
        debug('getAll called with:', request);
        try {
            const config = getConfiguration().comments;

            const {userId} = context.getUser();
            const {postId, parentId} = request;

            const postIdNumber = Number(postId);
            let parentIdNumber = Number(parentId);
            if (parentId === null || parentId === undefined) {
                parentIdNumber = null;
            }

            const {page = 1, limit = config.pagination.limit} = request;

            const pageNumber = Number(page);
            const limitNumber = Number(limit);

            new Validator()
                .isValidNumber(postIdNumber, 'postId')
                .isValidNumberOrNull(parentIdNumber, 'parentId')
                .isValidNumber(pageNumber, 'page')
                .isValidNumber(limitNumber, 'limit')
                .validate();

            const paginationBuilder = new PaginationBuilder(pageNumber, limitNumber);


            const {comments, total} = await crud.getComments(
                {
                    skip: paginationBuilder.skip,
                    limit: paginationBuilder.limit
                },
                {
                    postId: postIdNumber,
                    parentId: parentIdNumber,
                    userId
                }
            );

            paginationBuilder.setUrl(context.getRequestUrl()).setTotal(total);

            return SuccessHandler.handleWithPagination(
                StatusCodes.OK,
                comments,
                ResponseMessages.RESOURCE_FETCHED,
                paginationBuilder.build()
            );
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    static async remove(request) {
        debug('remove called with:', request);
        try {
            const {id} = request;
            const idNumber = Number(id);
            const {userId} = context.getUser();
            new Validator().isValidNumber(idNumber, 'id').validate();

            const {deleted, comment} = await crud.deleteComment({id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, comment, ResponseMessages.RESOURCE_DELETED);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    static async likeUnlike(request) {
        debug('likeUnlike called with:', request);
        try {
            const {id, op} = request;
            const idNumber = Number(id);
            const {userId} = context.getUser();
            new Validator().isValidNumber(idNumber, 'id').validate();

            const result = await crud.updateLikes({like: op}, {id: idNumber, userId});

            return SuccessHandler.handle(StatusCodes.OK, {}, `${ResponseMessages.RESOURCE_PROCEEDED}: ${result}`);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }
}

module.exports = CommentsController;