"use strict";

const debug = require('debug')('testing:health');

const request = require('supertest');
const helpers = require('./helpers');

const BASE_URL = `http://localhost:${process.env.PORT}`;

describe('API Endpoints', () => {
    test('GET /healthcheck - should return status 200', async () => {
        const response = await request(BASE_URL).get('/health');
        const actual = response.body;
        helpers.testStatusCode(response.status, 200);
        helpers.testOKMetadataStructure(actual.metadata);
    });
});
