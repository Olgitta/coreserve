'use strict';

const {StatusCodes} = require('http-status-codes');
const debug = require('debug')('coreserve:TodosController');
// todo: change to crud = require('./crud'); in all controllers
const crud = require('./crud');
const logger = require('#core/logger/index.js')('TodosController');
const Validator = require('#core/utils/Validator.js');
const context = require('#core/execution-context/context.js');
const getConfiguration = require('#config/configuration.js');
const {ApiErrorCodes, ValidationError} = require("#core/errors/index.js");
const {SuccessHandler, ErrorHandler, PaginationBuilder} = require("#apis/index.js");
const {getTodos} = require("#apis/todos/crud.js");

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
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async create(request) {
        try {
            const {title} = request;
            const {userId} = context.getUser();
            const errors = new Validator()
                .isNonEmptyString(title, 'title')
                .validate();

            if (errors) {
                throw new ValidationError('Failed to create todo: invalid input for title', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await crud.createTodo({userId, title});
            return SuccessHandler.handle(StatusCodes.CREATED, result, 'Resource created successfully');
        } catch (err) {
            logger.error('Error while creating a todo', err);
            return ErrorHandler.handleError(err);
        }
    }

    /**
     *
     * @param request
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|*>}
     */
    static async getAll(request) {
        try {
            const ctx = context.getCtx();
            const {userId} = context.getUser();
            const config = getConfiguration().todos;
            const {page = 1, limit = config.pagination.limit} = request;
            const paginationBuilder = new PaginationBuilder(page, limit);

            const {todos, total} = await getTodos({
                userId,
                skip: paginationBuilder.skip,
                limit: paginationBuilder.limit,
            });

            // todo: create context.getRequestUrl
            paginationBuilder
                .setUrl(ctx?.request?.url)
                .setTotal(total);

            return SuccessHandler.handleWithPagination(
                StatusCodes.OK,
                todos,
                'Todos fetched successfully',
                paginationBuilder.build()
            );
        } catch (err) {
            logger.error('Error while fetching all todos', err);
            return ErrorHandler.handleError(err);
        }
    }

    /**
     *
     * @param request
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async getById(request) {
        try {
            const {userId} = context.getUser();
            const {id} = request;

            const errors = new Validator()
                .isNonEmptyString(id, 'id')
                .validate();

            if (errors) {
                throw new ValidationError('Failed to fetch todo: invalid ID', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await crud.getTodoById({_id: id, userId});

            return SuccessHandler.handle(StatusCodes.OK, result, 'Todo fetched successfully');
        } catch (err) {
            logger.error('Error while fetching todo by ID', err);
            return ErrorHandler.handleError(err);
        }
    }

    /**
     *
     * @param request
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async update(request) {
        try {
            const {userId} = context.getUser();
            const {id, completed} = request;
            const completedBool = Boolean(completed);

            const errors = new Validator()
                .isNonEmptyString(id, 'id')
                .isValidBoolean(completedBool, 'completed')
                .validate();

            if (errors) {
                throw new ValidationError('Failed to update todo: invalid input', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await crud.updateTodo({completed: completedBool}, {_id: id, userId});
            debug('update todo:result', result);

            return SuccessHandler.handle(StatusCodes.OK, result, 'Todo updated successfully');
        } catch (err) {
            logger.error('Error while updating todo', err);
            return ErrorHandler.handleError(err);
        }
    }

    /**
     *
     * @param request
     * @returns {Promise<{statusCode: StatusCodes, error: ApiError}|{statusCode: StatusCodes.OK, resources, message}>}
     */
    static async remove(request) {
        try {
            const {userId} = context.getUser();
            const {id} = request;

            const errors = new Validator()
                .isNonEmptyString(id, 'id')
                .validate();

            if (errors) {
                throw new ValidationError('Failed to delete todo: invalid ID', ApiErrorCodes.BAD_REQUEST, errors);
            }

            const result = await crud.deleteTodo({id, userId});
            debug('remove:result', result);

            return SuccessHandler.handle(StatusCodes.OK, result, 'Todo deleted successfully');
        } catch (err) {
            logger.error('Error while deleting todo', err);
            return ErrorHandler.handleError(err);
        }
    }
}

module.exports = TodosController;