'use strict';

require('../../mocks');

const TodosController = require('#apis/todos/TodosController.js');
const context = require('#core/execution-context/context.js');
const {createTodo, deleteTodo, getTodoById, getTodos, updateTodo} = require('#apis/todos/crud.js');

const {
    CREATE_201, CREATE_400,
    DELETE_200, DELETE_400,
    GET_ALL_200, GET_ALL_200_NO_PAGINATION_PARAMS, GET_ALL_200_NO_RECORDS_FOUND, GET_ALL_400,
    GET_BY_ID_200, GET_BY_ID_400,
    UPDATE_200, UPDATE_400,
} = require('./helpers');
const getConfiguration = require('#config/configuration.js');

jest.mock('#config/configuration.js', () => jest.fn());

jest.mock('#core/execution-context/context.js', () => {
    const {USER_ID, CTX_PAYLOAD} = require('./helpers');

    return {
        getUser: jest.fn().mockReturnValue({userId: USER_ID}),
        getCtx: jest.fn().mockReturnValue(CTX_PAYLOAD),
        getRequestUrl: jest.fn().mockReturnValue(CTX_PAYLOAD.request.url),
    }
});

jest.mock('#apis/todos/crud.js', () => ({
    createTodo: jest.fn(),
    deleteTodo: jest.fn(),
    getTodoById: jest.fn(),
    getTodos: jest.fn(),
    updateTodo: jest.fn(),
}));

describe('TodosController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getInstance', () => {
        it('should return the singleton instance of TodosController', () => {
            const instance1 = TodosController.getInstance();
            const instance2 = TodosController.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('should throw an error if the constructor is called directly', () => {
            expect(() => new TodosController()).toThrow(Error);
        });
    });

    describe('create', () => {
        it('should create a todo successfully', async () => {
            const {
                crudReceives,
                crudReturns,
                expected,
                request
            } = CREATE_201();

            createTodo.mockResolvedValue(crudReturns);
            const actual = await TodosController.create(request);

            expect(createTodo).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toBe(expected.statusCode);
        });

        it('should handle validation errors', async () => {
            const {
                expected,
                request
            } = CREATE_400();

            const actual = await TodosController.create(request);

            expect(createTodo).not.toHaveBeenCalled();
            expect(actual.statusCode).toBe(expected.statusCode);
        });
    });

    describe('getAll', () => {
        it('should fetch all todos successfully', async () => {
            const {
                configMock,
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_ALL_200();

            getConfiguration.mockReturnValue(configMock);
            getTodos.mockResolvedValue(crudReturns);
            const actual = await TodosController.getAll(request);

            expect(getTodos).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should fetch all todos successfully and default to first page when pagination parameters are not provided', async () => {
            const {
                configMock,
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_ALL_200_NO_PAGINATION_PARAMS();

            getConfiguration.mockReturnValue(configMock);
            getTodos.mockResolvedValue(crudReturns);

            const actual = await TodosController.getAll(request);

            expect(getTodos).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should fetch all todos successfully when no records found', async () => {
            const {
                configMock,
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_ALL_200_NO_RECORDS_FOUND();

            getConfiguration.mockReturnValue(configMock);
            getTodos.mockResolvedValue(crudReturns);

            const actual = await TodosController.getAll(request);

            expect(getTodos).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should return BAD_REQUEST when input is invalid', async () => {
            const {configMock, expected, request} = GET_ALL_400();

            getConfiguration.mockReturnValue(configMock);

            const actual = await TodosController.getAll(request);

            expect(getTodos).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toBeUndefined();
        });

    });

    describe('getById', () => {
        it('should return OK and the resource for the specified id', async () => {
            const {crudReceives, crudReturns, expected, request} = GET_BY_ID_200();

            getTodoById.mockResolvedValue(crudReturns);

            const actual = await TodosController.getById(request);

            expect(getTodoById).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when called with an invalid id', async () => {
            const {expected, request} = GET_BY_ID_400();

            const actual = await TodosController.getById(request);

            expect(getTodoById).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('update', () => {
        it('should update a resource and return the updated resource', async () => {
            const {
                crudReceives,
                crudReturns,
                expected,
                request
            } = UPDATE_200();

            updateTodo.mockResolvedValue(crudReturns);

            const actual = await TodosController.update(request);

            expect(updateTodo).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when input is invalid', async () => {
            const {expected, request} = UPDATE_400();

            const actual = await TodosController.update(request);

            expect(updateTodo).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('remove', () => {
        it('should delete a resource by id and return the deleted resource', async () => {
            const {crudReceives, crudReturns, expected, request} = DELETE_200();

            deleteTodo.mockResolvedValue(crudReturns);

            const actual = await TodosController.remove(request);

            expect(deleteTodo).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when called with an invalid id', async () => {
            const {expected, request} = DELETE_400();

            const actual = await TodosController.remove(request);

            expect(deleteTodo).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });
});
