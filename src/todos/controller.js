'use strict';

const {StatusCodes} = require('http-status-codes');
const {createTodo, getTodoById, updateTodo, deleteTodo, getTodosWithPagination} = require('./crud');
const log = require('../core/logger');
const {isNonEmptyString, isNonEmptyObject} = require('../core/utils/validators');
const {Types} = require('mongoose');
const debug = require('debug')('coreserve:todos');
const {getCtx} = require('../core/execution-context/context');
const getConfiguration=require('../core/configuration');

async function create(title) {
    try {
        if (!isNonEmptyString(title)) {
            log.error('Todos Controller:create:invalid input');
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await createTodo(title);
        return {statusCode: StatusCodes.CREATED, resources: result};
    } catch (err) {
        log.error(`Todos Controller:create:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function getAll(requestQuery) {
    try {
        const ctx = getCtx();
        debug('Todos Controller:getAll ctx', ctx);
        const config = getConfiguration();
        debug('Todos Controller:getAll config', config);
        const {page, limit} = normalizePaginationParams(requestQuery, config.todos);

        const skip = (page - 1) * limit;
        const {todos, total} = await getTodosWithPagination(skip, limit);

        const {totalPages, hasNextPage, hasPrevPage} = derivePagination(total, page, limit);

        const cleanUrl = ctx?.request?.url.split('?')[0];
        const nextPage = hasNextPage ? `${cleanUrl}?page=${page + 1}&limit=${limit}` : null;
        const prevPage = hasPrevPage ? `${cleanUrl}?page=${page - 1}&limit=${limit}` : null;

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
        log.error(`Todos Controller:getAll:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function getById(id) {
    try {
        if (!isNonEmptyString(id) || !isValidObjectId(id)) {
            log.error('Todos Controller:getById:invalid input');
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await getTodoById(id);
        if (result === null) {
            log.error('Todos Controller:getById:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`Todos Controller:getById:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function update(id, updates) {
    try {
        if (!isNonEmptyString(id) || !isValidObjectId(id) || !isNonEmptyObject(updates)) {
            log.error('Todos Controller:update:invalid input');
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await updateTodo(id, updates);
        if (result === null) {
            log.error('Todos Controller:update:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`Todos Controller:update:error: ${err.message}`, err);
        return handleError(err);
    }
}

async function remove(id) {
    try {
        if (!isNonEmptyString(id) || !isValidObjectId(id)) {
            log.error('Todos Controller:remove:invalid input');
            return {statusCode: StatusCodes.BAD_REQUEST};
        }

        const result = await deleteTodo(id);
        if (result === null) {
            log.error('Todos Controller:remove:not found');
            return {statusCode: StatusCodes.NOT_FOUND};
        }

        return {statusCode: StatusCodes.OK, resources: result};
    } catch (err) {
        log.error(`Todos Controller:remove:error: ${err.message}`, err);
        return handleError(err);
    }
}

function normalizePaginationParams(requestQuery, config) {
    const {page, limit} = requestQuery;
    const p = Number.parseInt(page);
    const l = Number.parseInt(limit);
    return {
        page: Number.isNaN(p) || p < 1 ? 1 : p,
        limit: Number.isNaN(l) || l < 1 ? config.pagination.limit : l,
    };
}

function derivePagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        totalPages,
        hasNextPage,
        hasPrevPage,
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
