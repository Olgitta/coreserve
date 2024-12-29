'use strict';

const {StatusCodes} = require('http-status-codes');
const debug = require('debug')('coreserve:TodosController');

const crud = require('./crud');
const logger = require('#core/logger/index.js')('TodosController');
const Validator = require('#core/utils/Validator.js');
const context = require('#core/execution-context/context.js');
const getConfiguration = require('#config/configuration.js');
const {SuccessHandler, ErrorHandler, PaginationBuilder} = require('#apis/index.js');
const {ResponseMessages} = require('#apis/consts/index.js');

class TodosController {
    static #instance;

    constructor() {
        if (new.target === TodosController) {
            throw new Error('TodosController is a singleton. Use TodosController.getInstance() to access the instance.');
        }
    }

    static getInstance() {
        if (!TodosController.#instance) {
            TodosController.#instance = this;
        }
        return TodosController.#instance;
    }

    /**
     *
     * @param request
     * @param request.title
     * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async create(request) {
        try {
            const {title} = request;
            const {userId} = context.getUser();

            new Validator()
                .isNonEmptyString(title, 'title')
                .validate();

            const result = await crud.createTodo({userId, title});
            return SuccessHandler.handle(StatusCodes.CREATED, result, ResponseMessages.RESOURCE_CREATED);
        } catch (err) {
            logger.error('Error while creating a todo', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.page
     * @param request.limit
     * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|*>}
     */
    static async getAll(request) {
        try {
            const {userId} = context.getUser();
            const config = getConfiguration().todos;
            const {page = 1, limit = config.pagination.limit} = request;
            const pageNumber = Number(page);
            const limitNumber = Number(limit);

            new Validator()
                .isValidNumber(pageNumber, 'page')
                .isValidNumber(limitNumber, 'limit')
                .validate();

            const paginationBuilder = new PaginationBuilder(pageNumber, limitNumber);

            const {todos, total} = await crud.getTodos({
                skip: paginationBuilder.skip,
                limit: paginationBuilder.limit,
            }, {userId});

            paginationBuilder
                .setUrl(context.getRequestUrl())
                .setTotal(total);

            return SuccessHandler.handleWithPagination(
                StatusCodes.OK,
                todos,
                ResponseMessages.RESOURCE_FETCHED,
                paginationBuilder.build()
            );
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async getById(request) {
        try {
            const {userId} = context.getUser();
            const {id} = request;

            new Validator()
                .isNonEmptyString(id, 'id')
                .validate();

            const result = await crud.getTodoById({id, userId});

            return SuccessHandler.handle(StatusCodes.OK, result, ResponseMessages.RESOURCE_FETCHED);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @param request.completed
     * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async update(request) {
        try {
            const {userId} = context.getUser();
            const {id, completed} = request;

            new Validator()
                .isNonEmptyString(id, 'id')
                .isValidBoolean(completed, 'completed')
                .validate();

            const result = await crud.updateTodo({completed: completed}, {id, userId});
            debug('update todo:result', result);

            return SuccessHandler.handle(StatusCodes.OK, result, ResponseMessages.RESOURCE_UPDATED);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }

    /**
     *
     * @param request
     * @param request.id
     * @returns {Promise<{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: ApiError}|{statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async remove(request) {
        try {
            const {userId} = context.getUser();
            const {id} = request;

            new Validator()
                .isNonEmptyString(id, 'id')
                .validate();

            const result = await crud.deleteTodo({id, userId});
            const deleted = result ? 1 : 0;

            return SuccessHandler.handle(StatusCodes.OK, null, `${ResponseMessages.RESOURCE_DELETED}:${deleted}`);
        } catch (err) {
            logger.error(err.message || 'Execution error.', err);
            return ErrorHandler.handle(err);
        }
    }
}

module.exports = TodosController;