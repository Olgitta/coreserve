"use strict";

const debug = require('debug')('testing:todosapi');

const request = require('supertest');
const {faker} = require('@faker-js/faker');
const helpers = require('./helpers');

describe('TODOS API Endpoints', () => {

    const requestPath = '/todos';
    const jwtToken = helpers.createTestToken();
    const auth = ['Authorization', `Bearer ${jwtToken}`];
    const toRemove = [];

    const createResource = async () => {

        const rs = await request(helpers.BASE_URL)
            .post(requestPath)
            .send({
                title: faker.lorem.sentence(),
            })
            .set(...auth)
            .set('Content-Type', 'application/json');

        toRemove.push(rs.body.resources.id);

        return rs;
    }

    describe('Happy Path Scenarios', () => {

        test('POST /todos - successfully creates a new todo item', async () => {
            // Act
            const response = await createResource();
            const actual = response.body;
            debug('Create a new resource', actual);

            // Assert
            helpers.testStatusCode(response.status, 201);
            helpers.testTodoStructure(actual.resources);
            helpers.testOKMetadataStructure(actual.metadata);
        });

        test('PUT /todos/:id - successfully updates an existing todo item', async () => {

            const created = await createResource();
            const id = created.body.resources.id;

            // Act: Update the resource
            const response = await request(helpers.BASE_URL)
                .put(`${requestPath}/${id}`)
                .send({
                    completed: true
                })
                .set(...auth)
                .set('Content-Type', 'application/json');
            const actual = response.body;
            debug('Update an existing resource', actual);
            // Assert
            helpers.testStatusCode(response.status, 200);
            helpers.testTodoStructure(actual.resources);
            helpers.testOKMetadataStructure(actual.metadata);
        });

        test('GET /todos - retrieves a paginated list of todos', async () => {
            // Arrange: Populate the resources
            for (let i = 0; i <= 5; i++) {
                await createResource();
            }

            // Act: Fetch the resources
            const response = await request(helpers.BASE_URL).get(requestPath).query({
                page: 2,
                limit: 2
            }).set(...auth);
            const actual = response.body;
            debug('Fetch paginated resources', actual);

            // Assert
            helpers.testStatusCode(response.status, 200);
            helpers.testOKMetadataStructure(actual.metadata);
            expect(actual.resources).toBeInstanceOf(Array);
            expect(actual.resources.length).toEqual(2);
            helpers.testTodoStructure(actual.resources[0]);

            helpers.testPaginationStructure(actual.pagination);
            expect(actual.pagination.total).toBeGreaterThan(0);
            expect(actual.pagination.totalPages).toBeGreaterThan(0);
            expect(actual.pagination.prevPage).not.toBeUndefined();
            expect(actual.pagination.nextPage).not.toBeUndefined();

        });

        test('GET /todos/:id - retrieves details of a specific todo item', async () => {

            const created = await createResource();
            const id = created.body.resources.id;
            const createdResource = created.body.resources;

            // Act: Fetch the resource by ID
            const response = await request(helpers.BASE_URL).get(`${requestPath}/${id}`).set(...auth);
            const actual = response.body;
            debug('Fetch resource by ID', actual);

            // Assert
            helpers.testStatusCode(response.status, 200);
            helpers.testTodoStructure(actual.resources);
            helpers.testOKMetadataStructure(actual.metadata);
        });

        test('DELETE /todos/:id - successfully deletes todo items created during tests', async () => {

            for (const id of toRemove) {
                const response = await request(helpers.BASE_URL).delete(`${requestPath}/${id}`).set(...auth);
                debug('Delete resource by ID', response.body);
                helpers.testStatusCode(response.status, 200);
                helpers.testOKMetadataStructure(response.body.metadata);
            }
        });
    });

    describe('Negative Path Tests', () => {

        describe('Invalid Input Tests', () => {

            test('POST /todos - Create a new resource should respond with 400', async () => {

                const rs1 = await request(helpers.BASE_URL)
                    .post(requestPath)
                    .send({
                        title: '',
                    })
                    .set(...auth)
                    .set('Content-Type', 'application/json');
                const actual1 = rs1.body;
                debug('Invalid title', actual1);

                // Assert
                helpers.testStatusCode(rs1.status, 400);
                helpers.test400MetadataStructure(actual1.metadata);
            });

            test('PUT /todos/:id - Update an existing resource should respond with 400', async () => {
                const response = await request(helpers.BASE_URL)
                    .put(`${requestPath}/100500`)
                    .send({})
                    .set(...auth)
                    .set('Content-Type', 'application/json');
                const actual = response.body;
                debug('Update an existing resource', actual);
                // Assert
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);
            });

            test('GET /todos - Fetch paginated resources should respond with 400', async () => {
                const response = await request(helpers.BASE_URL).get(requestPath).query({
                    page: '210invalid',
                    limit: 2
                }).set(...auth);
                const actual = response.body;
                debug('Fetch paginated resources', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);
            });

        });

    });

});
