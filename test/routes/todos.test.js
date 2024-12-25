/**
 * These tests ensure that the routes exist and respond as expected.
 * They don’t test the implementation details of handlers.
 */
const request = require('supertest');
const express = require('express');
const {Types} = require('mongoose');
const {faker} = require('@faker-js/faker');
const todosRouter = require('../../src/routes/todos');

const app = express();
app.use(express.json());
app.use('/api/todos', todosRouter);

const {create, getById, update, remove, getAll} = require('../../src/apis/todos/controller');
jest.mock('../../src/apis/todos/controller');

const generateDynamicId = () => new Types.ObjectId().toString();

describe('Todos API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/todos', async () => {
        getAll.mockResolvedValue({statusCode: 200});

        const res = await request(app).get('/api/todos');
        expect(res.statusCode).toBe(200);
    });

    it('GET /api/todos/:id', async () => {
        getById.mockResolvedValue({statusCode: 200});

        const res = await request(app).get(`/api/todos/${generateDynamicId()}`);
        expect(res.statusCode).toBe(200);
    });

    it('POST /api/todos', async () => {
        create.mockResolvedValue({statusCode: 201});

        const res = await request(app).post('/api/todos').send({title: faker.lorem.sentence()});
        expect(res.statusCode).toBe(201);
    });

    it('PUT /api/todos/:id', async () => {
        update.mockResolvedValue({statusCode: 200});

        const res = await request(app).put(`/api/todos/${generateDynamicId()}`).send({title: faker.lorem.sentence()});
        expect(res.statusCode).toBe(200);
    });

    it('DELETE /api/todos/:id', async () => {
        remove.mockResolvedValue({statusCode: 200});

        const res = await request(app).delete(`/api/todos/${generateDynamicId()}`);
        expect(res.statusCode).toBe(200);
    });
});
