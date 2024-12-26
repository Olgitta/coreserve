const request = require('supertest');
const {testStatusCode, testOKMetadataStructure} = require('./helpers');

const BASE_URL = `http://localhost:${process.env.E2EPORT}`;

describe('API Endpoints', () => {
    test('GET /healthcheck - should return status 200', async () => {
        const response = await request(BASE_URL).get('/health');
        const actual = response.body;
        testStatusCode(response.status, 200);
        testOKMetadataStructure(actual.metadata);
    });
});
