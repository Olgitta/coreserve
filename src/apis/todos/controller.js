'use strict';

const {StatusCodes} = require('http-status-codes');
const {createTodo, getTodoById, updateTodo, deleteTodo, getTodosWithPagination} = require('./crud');
const logger = require('../../core/logger')('TodosController');
const Validator = require('../../core/utils/Validator');
const {Types} = require('mongoose');
const debug = require('debug')('coreserve:TodosController');
const {getCtx} = require('../../core/execution-context/context');
const getConfiguration=require('../../config/configuration');
const {PaginationBuilder, normalizePaginationParams} = require('../PaginationBuilder');

async function create(title) {
    try {
        const {errors} = new Validator()
            .isNonEmptyString(title)
            .validate();

        if(errors) {
            logger.error(`create:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await createTodo(title);
        return {statusCode: StatusCodes.CREATED, resources: result};
    } catch (err) {
        logger.error('create:error', err);
        return handleError(err);
    }
}

async function getAll(requestQuery) {
    try {
        const ctx = getCtx();
        debug('getAll ctx', ctx);
        const config = getConfiguration();
        debug('getAll config', config);
        const {page, limit} = normalizePaginationParams(requestQuery.page, requestQuery.limit, config.todos);

        const skip = (page - 1) * limit;
        const {todos, total} = await getTodosWithPagination(skip, limit);
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
            resources: todos,
            pagination: {
                nextPage,
                prevPage,
                totalPages
            }
        };
    } catch (err) {
        logger.error(`getAll:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function getById(id) {
    try {
        const {errors} = new Validator()
            .isNonEmptyString(id)
            .validate();

        if(errors) {
            logger.error(`getById:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        if (!isValidObjectId(id)) {
            logger.error('getById:invalid input');
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await getTodoById(id);
        if (result === null) {
            logger.error('getById:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        logger.error(`getById:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function update(id, updates) {
    try {
        const {errors} = new Validator()
            .isNonEmptyString(id)
            .isNonEmptyObject(updates)
            .validate();

        if(errors) {
            logger.error(`update:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        if (!isValidObjectId(id)) {
            logger.error('update:invalid input');
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await updateTodo(id, updates);
        if (result === null) {
            logger.error('update:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        logger.error(`update:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function remove(id) {
    try {
        const {errors} = new Validator()
            .isNonEmptyString(id)
            .validate();

        if(errors) {
            logger.error(`remove:invalid input:${errors.join(',')}`);
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        if (!isValidObjectId(id)) {
            logger.error('remove:invalid input');
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await deleteTodo(id);
        if (result === null) {
            logger.error('remove:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        logger.error(`remove:error: ${err.message}`, err);
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

function isValidObjectId(id) {
    return Types.ObjectId.isValid(id);
}

module.exports = {create, getAll, getById, update, remove};
