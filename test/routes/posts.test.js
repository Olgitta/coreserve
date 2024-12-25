/**
 * These tests ensure that the routes exist and respond as expected.
 * They don’t test the implementation details of handlers.
 */
const request = require('supertest');
const express = require('express');
const {faker} = require('@faker-js/faker');
const postsRouter = require('../../src/apis/posts/routes');

const app = express();
app.use(express.json());
app.use('/api/posts', postsRouter);

const {create, getById, update, remove, getAll, like, unlike} = require('../../src/apis/posts/controller');
const crud = require('../../src/apis/posts/crud');

jest.mock('../../src/apis/posts/controller');
jest.mock('../../src/apis/posts/crud', () => ({
    createPost: jest.fn(),
    deletePost: jest.fn(),
    getPostsWithPagination: jest.fn(),
    getPostById: jest.fn(),
    updatePost: jest.fn(),
    updateLikes: jest.fn(),
}));

describe('Posts API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/posts', async () => {
        getAll.mockResolvedValue({statusCode: 200});

        const res = await request(app).get('/api/posts');
        expect(res.statusCode).toBe(200);
    });

    it('GET /api/posts/:id', async () => {
        getById.mockResolvedValue({statusCode: 200});

        const res = await request(app).get(`/api/posts/100`);
        expect(res.statusCode).toBe(200);
    });

    it('POST /api/posts', async () => {
        create.mockResolvedValue({statusCode: 201});

        const res = await request(app).post('/api/posts').send({title: faker.lorem.sentence()});
        expect(res.statusCode).toBe(201);
    });

    it('PUT /api/posts/:id', async () => {
        update.mockResolvedValue({statusCode: 200});

        const res = await request(app).put(`/api/posts/100`).send({title: faker.lorem.sentence()});
        expect(res.statusCode).toBe(200);
    });

    it('DELETE /api/posts/:id', async () => {
        remove.mockResolvedValue({statusCode: 200});

        const res = await request(app).delete(`/api/posts/100`);
        expect(res.statusCode).toBe(200);
    });
});
