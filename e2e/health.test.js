const request = require('supertest');
const {testStatusAndTraceId, } = require('./helpers');

const BASE_URL = `http://localhost:${process.env.E2EPORT}`;

describe('API Endpoints', () => {
    test('GET /healthcheck - should return status 200', async () => {
        const response = await request(BASE_URL).get('/health');
        const actual = response.body;
        testStatusAndTraceId(response.status, actual.metadata.traceId, 200);

    });
});
