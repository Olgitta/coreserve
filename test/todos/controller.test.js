'use strict';

const {Types} = require("mongoose");
const {create, getAll, getById, update, remove} = require('../../src/todos/controller');
const {StatusCodes} = require('http-status-codes');
const {createTodo, getTodoById, updateTodo, deleteTodo, getTodosWithPagination} = require('../../src/todos/crud');
const log = require('../../src/core/logger');
const {isNonEmptyString, isNonEmptyObject} = require('../../src/core/utils/validators');
const {getCtx} = require('../../src/core/execution-context/context');
const getConfiguration = require('../../src/config/configuration');
const {PaginationBuilder, normalizePaginationParams} = require('../../src/pagination');

jest.mock('../../src/todos/crud');
jest.mock('../../src/core/logger');
jest.mock('../../src/core/utils/validators');
jest.mock('../../src/core/execution-context/context');
jest.mock('../../src/config/configuration');

jest.mock('../../src/pagination', () => ({
    PaginationBuilder: jest.fn().mockImplementation(() => ({
        setUrl: jest.fn().mockReturnThis(),
        setTotal: jest.fn().mockReturnThis(),
        setLimit: jest.fn().mockReturnThis(),
        setPage: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({
            totalPages: 1,
            nextPage: null,
            prevPage: null,
        }),
    })),
    normalizePaginationParams: jest.fn(),
}));

const generateDynamicId = () => new Types.ObjectId().toString();

describe('TodosController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should return BAD_REQUEST if title is invalid', async () => {
            isNonEmptyString.mockReturnValue(false);

            const result = await create('');

            expect(result).toEqual({statusCode: StatusCodes.BAD_REQUEST});
            expect(log.error).toHaveBeenCalledWith('Todos Controller:create:invalid input');
        });

        it('should return CREATED with resources on success', async () => {
            isNonEmptyString.mockReturnValue(true);
            const mockTodo = {id: '1', title: 'Test Todo'};
            createTodo.mockResolvedValue(mockTodo);

            const result = await create('Test Todo');

            expect(result).toEqual({statusCode: StatusCodes.CREATED, resources: mockTodo});
            expect(createTodo).toHaveBeenCalledWith('Test Todo');
        });

        it('should handle errors', async () => {
            isNonEmptyString.mockReturnValue(true);
            const error = new Error('Mock Error');
            createTodo.mockRejectedValue(error);

            const result = await create('Test Todo');

            expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(result.reason).toBe('Mock Error');
            expect(log.error).toHaveBeenCalled();
        });
    });

    describe('getAll', () => {
        it('should return OK with resources and pagination', async () => {
            getCtx.mockReturnValue({request: {url: '/todos'}});
            getConfiguration.mockReturnValue({todos: {defaultPageSize: 10}});
            normalizePaginationParams.mockReturnValue({page: 1, limit: 10});
            getTodosWithPagination.mockResolvedValue({
                todos: [{id: '1', title: 'Todo 1'}],
                total: 1,
            });

            const result = await getAll({page: 1, limit: 10});

            expect(result.statusCode).toBe(StatusCodes.OK);
            expect(result.resources).toEqual([{id: '1', title: 'Todo 1'}]);
            expect(result.pagination).toHaveProperty('totalPages');
        });

        it('should handle errors', async () => {
            const error = new Error('Mock Error');
            getTodosWithPagination.mockRejectedValue(error);

            const result = await getAll({});

            expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(log.error).toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should return BAD_REQUEST if id is invalid', async () => {
            isNonEmptyString.mockReturnValue(false);

            const result = await getById('invalidId');

            expect(result).toEqual({statusCode: StatusCodes.BAD_REQUEST});
        });

        it('should return NOT_FOUND if no todo is found', async () => {
            isNonEmptyString.mockReturnValue(true);
            getTodoById.mockResolvedValue(null);

            const result = await getById(generateDynamicId());

            expect(result).toEqual({statusCode: StatusCodes.NOT_FOUND});
        });

        it('should return OK with resources on success', async () => {
            const id = generateDynamicId();
            const mockTodo = {id: id, title: 'Todo 1'};
            isNonEmptyString.mockReturnValue(true);
            getTodoById.mockResolvedValue(mockTodo);

            const result = await getById(id);

            expect(result).toEqual({statusCode: StatusCodes.OK, resources: mockTodo});
        });
    });

    describe('update', () => {
        it('should return BAD_REQUEST if input is invalid', async () => {
            isNonEmptyString.mockReturnValue(false);

            const result = await update(generateDynamicId(), {});

            expect(result).toEqual({statusCode: StatusCodes.BAD_REQUEST});
        });

        it('should return NOT_FOUND if no todo is updated', async () => {
            isNonEmptyString.mockReturnValue(true);
            isNonEmptyObject.mockReturnValue(true);
            updateTodo.mockResolvedValue(null);

            const result = await update(generateDynamicId(), {title: 'Updated Todo'});

            expect(result).toEqual({statusCode: StatusCodes.NOT_FOUND});
        });

        it('should return OK with resources on success', async () => {
            const id = generateDynamicId();
            const mockUpdatedTodo = {id: id, title: 'Updated Todo'};
            isNonEmptyString.mockReturnValue(true);
            isNonEmptyObject.mockReturnValue(true);
            updateTodo.mockResolvedValue(mockUpdatedTodo);

            const result = await update(id, {title: 'Updated Todo'});

            expect(result).toEqual({statusCode: StatusCodes.OK, resources: mockUpdatedTodo});
        });
    });

    describe('remove', () => {
        it('should return BAD_REQUEST if id is invalid', async () => {
            isNonEmptyString.mockReturnValue(false);

            const result = await remove('invalidId');

            expect(result).toEqual({statusCode: StatusCodes.BAD_REQUEST});
        });

        it('should return NOT_FOUND if no todo is deleted', async () => {
            isNonEmptyString.mockReturnValue(true);
            deleteTodo.mockResolvedValue(null);

            const result = await remove(generateDynamicId());

            expect(result).toEqual({statusCode: StatusCodes.NOT_FOUND});
        });

        it('should return OK with resources on success', async () => {
            const id = generateDynamicId();
            const mockDeletedTodo = {id: id, title: 'Deleted Todo'};
            isNonEmptyString.mockReturnValue(true);
            deleteTodo.mockResolvedValue(mockDeletedTodo);

            const result = await remove(id);

            expect(result).toEqual({statusCode: StatusCodes.OK, resources: mockDeletedTodo});
        });
    });
});
