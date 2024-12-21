const request = require('supertest');
const {BASE_URL, testStatusAndTraceId, } = require('./helpers');


describe('API Endpoints', () => {
    test('GET /healthcheck - should return status 200', async () => {
        const response = await request(BASE_URL).get('/health');
        const actual = response.body;
        testStatusAndTraceId(response.status, actual.metadata.traceId, 200);

    });
});
