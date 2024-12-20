const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Todo = require('../../src/todos/Todo');
const { createTodo, getTodos, getTodoById, updateTodo, deleteTodo, getTodosWithPagination } = require('../../src/todos/crud');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Todo.deleteMany({});
});

describe('Todo CRUD Operations', () => {
    beforeEach(async () => {
        await Todo.deleteMany();
    });

    test('should create a new Todo', async () => {
        const todo = await createTodo('Test Todo');
        expect(todo).toHaveProperty('_id');
        expect(todo.title).toBe('Test Todo');
        expect(todo.completed).toBe(false);
    });

    test('should retrieve all Todos', async () => {
        await createTodo('Todo 1');
        await createTodo('Todo 2');
        const todos = await getTodos();
        expect(todos).toHaveLength(2);
        // ordered by updatedAt desc
        expect(todos[0].title).toBe('Todo 2');
        expect(todos[1].title).toBe('Todo 1');
    });

    test('should retrieve Todos per page and total', async () => {
        await createTodo('Todo 1');
        await createTodo('Todo 2');
        await createTodo('Todo 3');
        await createTodo('Todo 4');
        await createTodo('Todo 5');
        const {todos, total} = await getTodosWithPagination(3,3);
        expect(todos).toHaveLength(2);
        // ordered by updatedAt desc
        expect(todos[0].title).toBe('Todo 2');
        expect(todos[1].title).toBe('Todo 1');
        expect(total).toBe(5);
    });

    test('should retrieve a Todo by ID', async () => {
        const todo = await createTodo('Test Todo');
        const foundTodo = await getTodoById(todo._id);
        expect(foundTodo).toBeTruthy();
        expect(foundTodo.title).toBe('Test Todo');
    });

    test('should update a Todo by ID', async () => {
        const todo = await createTodo('Todo to Update');
        const updatedTodo = await updateTodo(todo._id, { title: 'Updated Todo', completed: true });
        expect(updatedTodo).toBeTruthy();
        expect(updatedTodo.title).toBe('Updated Todo');
        expect(updatedTodo.completed).toBe(true);
    });

    test('should delete a Todo by ID', async () => {
        const todo = await createTodo('Todo to Delete');
        const deletedTodo = await deleteTodo(todo._id);
        expect(deletedTodo).toBeTruthy();
        expect(deletedTodo._id.toString()).toBe(todo._id.toString());
    });

    test('should return null for non-existent Todo ID', async () => {
        const invalidId = new mongoose.Types.ObjectId();
        const result = await getTodoById(invalidId);
        expect(result).toBeNull();

        const updateResult = await updateTodo(invalidId, { title: 'Non-existent' });
        expect(updateResult).toBeNull();

        const deleteResult = await deleteTodo(invalidId);
        expect(deleteResult).toBeNull();
    });
});
