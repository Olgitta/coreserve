const request = require('supertest');
const {BASE_URL, test200andTraceId, } = require('./helpers');

describe('API Endpoints', () => {
    test('GET /healthcheck - should return status 200', async () => {
        const response = await request(BASE_URL).get('/health');
        const actual = response.body;
        test200andTraceId(response.status, actual.metadata.traceId);
        expect(actual).toHaveProperty('metadata.message', 'OK');
    });
});
