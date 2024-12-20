const {create, getAll, getById, update, remove} = require('../../src/todos/controller');
const {createTodo, getTodoById, getTodosWithPagination, updateTodo, deleteTodo} = require('../../src/todos/crud');
const {Types} = require("mongoose");
const log = require('../../src/core/logger');
const { getCtx } = require('../../src/core/execution-context/context');

jest.mock('../../src/todos/crud');
jest.mock('../../src/core/logger');
jest.mock('../../src/core/execution-context/context');

const generateDynamicId = () => new Types.ObjectId().toString();

describe('Todos Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should return BAD_REQUEST for invalid title', async () => {
            const result = await create('');
            expect(result.statusCode).toBe(400);
        });

        it('should return CREATED for valid title', async () => {
            const title = 'Test Todo';
            createTodo.mockResolvedValue({title});

            const result = await create(title);
            expect(result.statusCode).toBe(201);
            expect(result.resources.title).toBe(title);
        });

        it('should handle errors correctly', async () => {
            const errorMessage = 'Some error';
            createTodo.mockRejectedValue(new Error(errorMessage));

            const result = await create('Valid Title');
            expect(result.statusCode).toBe(500);
            expect(result.reason).toBe(errorMessage);
        });
    });

    describe('getAll', () => {
        const queryString = {page: 1, limit: 3};

        it('should return OK and paginated todos', async () => {
            const todos = [{title: 'Todo 1'}, {title: 'Todo 2'}, {title: 'Todo 3'}];
            const total = 6;
            getTodosWithPagination.mockResolvedValue({ todos, total });
            getCtx.mockReturnValue({
                request: {
                    url: '/todos?page=1&limit=3'
                }
            });

            const result = await getAll(queryString);
            expect(result.statusCode).toBe(200);
            expect(result.resources).toEqual(todos);
            expect(result.pagination).toEqual({
                nextPage: '/todos?page=2&limit=3',
                prevPage: null,
                totalPages: 2
            });
        });

        it('should handle errors correctly', async () => {
            const errorMessage = 'Some error';
            getTodosWithPagination.mockRejectedValue(new Error(errorMessage));

            const result = await getAll(queryString);
            expect(result.statusCode).toBe(500);
            expect(result.reason).toBe(errorMessage);
        });
    });

    describe('getById', () => {
        it('should return BAD_REQUEST for invalid id', async () => {
            const result = await getById('');
            expect(result.statusCode).toBe(400);
        });

        it('should return NOT_FOUND for non-existing todo', async () => {
            getTodoById.mockResolvedValue(null);

            const result = await getById(generateDynamicId());
            expect(result.statusCode).toBe(404);
        });

        it('should return OK and the todo for a valid id', async () => {
            const todo = {title: 'Test Todo'};
            getTodoById.mockResolvedValue(todo);

            const result = await getById(generateDynamicId());
            expect(result.statusCode).toBe(200);
            expect(result.resources).toEqual(todo);
        });
    });

    describe('update', () => {
        it('should return BAD_REQUEST for invalid id', async () => {
            const result = await update('', {title: 'Updated Todo'});
            expect(result.statusCode).toBe(400);
        });

        it('should return NOT_FOUND for non-existing todo', async () => {
            updateTodo.mockResolvedValue(null);

            const result = await update(generateDynamicId(), {title: 'Updated Todo'});
            expect(result.statusCode).toBe(404);
        });

        it('should return OK and the updated todo', async () => {
            const updatedTodo = {title: 'Updated Todo'};
            updateTodo.mockResolvedValue(updatedTodo);

            const result = await update(generateDynamicId(), {title: 'Updated Todo'});
            expect(result.statusCode).toBe(200);
            expect(result.resources).toEqual(updatedTodo);
        });
    });

    describe('remove', () => {
        it('should return BAD_REQUEST for invalid id', async () => {
            const result = await remove('');
            expect(result.statusCode).toBe(400);
        });

        it('should return NOT_FOUND for non-existing todo', async () => {
            deleteTodo.mockResolvedValue(null);

            const result = await remove(generateDynamicId());
            expect(result.statusCode).toBe(404);
        });

        it('should return OK after successful deletion', async () => {
            const deletedTodo = {title: 'Deleted Todo'};
            deleteTodo.mockResolvedValue(deletedTodo);

            const result = await remove(generateDynamicId());
            expect(result.statusCode).toBe(200);
            expect(result.resources).toEqual(deletedTodo);
        });
    });
});
