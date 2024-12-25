/**
 * These tests ensure that the routes exist and respond as expected.
 * They don’t test the implementation details of handlers.
 */
const request = require('supertest');
const express = require('express');
const {faker} = require('@faker-js/faker');
const commentsRouter = require('../../src/apis/comments/routes');

const app = express();
app.use(express.json());
app.use('/api/comments', commentsRouter);

const {create, getAll, likeUnlike, remove} = require('../../src/apis/comments/controller');
const crud = require('../../src/apis/comments/crud');

jest.mock('../../src/apis/comments/controller');
jest.mock('../../src/apis/comments/crud', () => ({
    createComment: jest.fn(),
    deleteComment: jest.fn(),
    getCommentsWithPagination: jest.fn(),
    updateComment: jest.fn(),
    updateLikes: jest.fn(),
}));

describe('Comments API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/comments', async () => {
        getAll.mockResolvedValue({statusCode: 200});

        const res = await request(app).get('/api/comments');
        expect(res.statusCode).toBe(200);
    });

    it('POST /api/comments', async () => {
        create.mockResolvedValue({statusCode: 201});

        const res = await request(app).post('/api/comments').send({content: faker.lorem.sentence()});
        expect(res.statusCode).toBe(201);
    });

    it('POST /api/comments/like/:id', async () => {
        likeUnlike.mockResolvedValue({statusCode: 200});

        const res = await request(app).post('/api/comments/like/100');
        expect(res.statusCode).toBe(200);
    });

    it('POST /api/comments/unlike/:id', async () => {
        likeUnlike.mockResolvedValue({statusCode: 200});

        const res = await request(app).post('/api/comments/unlike/100');
        expect(res.statusCode).toBe(200);
    });

    it('DELETE /api/comments/:id', async () => {
        remove.mockResolvedValue({statusCode: 200});

        const res = await request(app).delete('/api/comments/100');
        expect(res.statusCode).toBe(200);
    });
});
