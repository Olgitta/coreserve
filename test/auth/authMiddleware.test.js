'use strict';

require('../mocks');

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../../src/middlewares');

function createTestToken(payload = { userId: 1 }, secret = 'your_secret_key') {
    return jwt.sign(payload, secret, { expiresIn: '1h' }); // Token expires in 1 hour
}
const app = express();
const secret = 'your_secret_key';

app.use(authMiddleware);
app.get('/protected', (req, res) => {
    res.status(200).json({ message: 'Access granted' });
});

describe('authMiddleware', () => {
    it('should grant access with a valid token', async () => {
        const token = createTestToken({ userId: 1 }, secret);
        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Access granted');
    });

    it('should deny access with an invalid token', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer invalid_token');

        expect(response.status).toBe(401);
        // expect(response.body.message).toBe('Unauthorized: Invalid token');
    });

    it('should deny access when token is missing', async () => {
        const response = await request(app).get('/protected');
        expect(response.status).toBe(401);
        // expect(response.body.message).toBe('Unauthorized: Missing or invalid token');
    });
});
