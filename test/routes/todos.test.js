'use strict';

const request = require('supertest');
const express = require('express');
const todosRouter = require('../../src/routes/todos');
const {create, update, remove, getById, getAll} = require('../../src/todos/controller');
jest.mock('../../src/todos/controller');

const app = express();
app.use(express.json());
app.use('/todos', todosRouter);

describe('Todos Router', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /todos', () => {
        it('should create a new todo and return 201', async () => {
            create.mockResolvedValue({statusCode: 201, resources: {id: '123', title: 'Test Todo'}});

            const response = await request(app)
                .post('/todos')
                .send({title: 'Test Todo'});

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('resources.id', '123');
            expect(response.body).toHaveProperty('resources.title', 'Test Todo');
            expect(create).toHaveBeenCalledWith('Test Todo');
        });

        it('should return 400 for invalid input', async () => {
            create.mockResolvedValue({statusCode: 400});

            const response = await request(app)
                .post('/todos')
                .send({title: ''});

            expect(response.status).toBe(400);
            expect(create).toHaveBeenCalledWith('');
        });
    });

    describe('GET /todos', () => {
        it('should return all todos', async () => {
            getAll.mockResolvedValue({statusCode: 200, resources: [{id: '123', title: 'Test Todo'}]});

            const response = await request(app).get('/todos');

            expect(response.status).toBe(200);
            expect(response.body.resources).toHaveLength(1);
            expect(response.body.resources[0]).toHaveProperty('id', '123');
            expect(getAll).toHaveBeenCalled();
        });
    });

    describe('GET /todos/:id', () => {
        it('should return a todo by ID', async () => {
            getById.mockResolvedValue({statusCode: 200, resources: {id: '123', title: 'Test Todo'}});

            const response = await request(app).get('/todos/123');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('resources.id', '123');
            expect(getById).toHaveBeenCalledWith('123');
        });

        it('should return 404 if todo is not found', async () => {
            getById.mockResolvedValue({statusCode: 404});

            const response = await request(app).get('/todos/999');

            expect(response.status).toBe(404);
            expect(getById).toHaveBeenCalledWith('999');
        });
    });

    describe('PUT /todos/:id', () => {
        it('should update a todo and return 200', async () => {
            update.mockResolvedValue({statusCode: 200, resources: {id: '123', title: 'Updated Todo'}});

            const response = await request(app)
                .put('/todos/123')
                .send({title: 'Updated Todo'});

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('resources.title', 'Updated Todo');
            expect(update).toHaveBeenCalledWith('123', {title: 'Updated Todo'});
        });

        it('should return 404 if todo is not found', async () => {
            update.mockResolvedValue({statusCode: 404});

            const response = await request(app)
                .put('/todos/999')
                .send({title: 'Updated Todo'});

            expect(response.status).toBe(404);
            expect(update).toHaveBeenCalledWith('999', {title: 'Updated Todo'});
        });
    });

    describe('DELETE /todos/:id', () => {
        it('should delete a todo and return 200', async () => {
            remove.mockResolvedValue({statusCode: 200, resources: {id: '123', title: 'Test Todo'}});

            const response = await request(app).delete('/todos/123');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('resources.id', '123');
            expect(remove).toHaveBeenCalledWith('123');
        });

        it('should return 404 if todo is not found', async () => {
            remove.mockResolvedValue({statusCode: 404});

            const response = await request(app).delete('/todos/999');

            expect(response.status).toBe(404);
            expect(remove).toHaveBeenCalledWith('999');
        });
    });
});
