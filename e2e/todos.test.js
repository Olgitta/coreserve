const request = require('supertest');
const {BASE_URL, testStatusAndTraceId, testTodoStructure,} = require('./helpers');

describe('TODOS API Endpoints', () => {

    describe('happy path', () => {

        const toRemove = [];

        test('POST /todos - should create a new todo', async () => {
            const newItem = {title: 'todo e2e 1'};
            const response = await request(BASE_URL)
                .post('/todos')
                .send(newItem)
                .set('Content-Type', 'application/json');

            const actual = response.body;

            testStatusAndTraceId(response.status, actual.metadata.traceId, 201);
            testTodoStructure(actual.resources);

            expect(actual.resources.title).toEqual(newItem.title);

            toRemove.push(actual.resources.id);
        });

        test('PUT /todos/:id - should update an existing todo', async () => {
            const newItem = {title: 'todo e2e 1'};
            const created = await request(BASE_URL)
                .post('/todos')
                .send(newItem)
                .set('Content-Type', 'application/json');

            const id = created.body.resources.id;

            const updateData = {title: 'updated todo', completed: true};
            const response = await request(BASE_URL)
                .put(`/todos/${id}`)
                .send(updateData)
                .set('Content-Type', 'application/json');

            const actual = response.body;

            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            testTodoStructure(actual.resources);
            expect(actual.resources.title).toEqual(updateData.title);
            expect(actual.resources.completed).toEqual(updateData.completed);

            toRemove.push(id);
        });

        test('GET /todos - paginated - should return status 200', async () => {
            const response = await request(BASE_URL).get('/todos').query({page: 1, limit: 10});
            const actual = response.body;

            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            expect(actual.resources).toBeInstanceOf(Array);
            expect(actual.pagination.totalPages).toBeGreaterThan(0);
            testTodoStructure(actual.resources[0]);
        });

        test('GET /todos/:id - should return status 200', async () => {
            const newItem = {title: 'todo e2e get by id'};
            const created = await request(BASE_URL)
                .post('/todos')
                .send(newItem)
                .set('Content-Type', 'application/json');

            const id = created.body.resources.id;

            const response = await request(BASE_URL).get(`/todos/${id}`);
            const actual = response.body;

            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            testTodoStructure(actual.resources);

            expect(actual.resources.title).toEqual(newItem.title);

            toRemove.push(id);

        });

        test('DELETE /todos/:id - should delete todo', async () => {

            for (const id of toRemove) {
                const response = await request(BASE_URL).delete(`/todos/${id}`);
                testStatusAndTraceId(response.status, response.body.metadata.traceId, 200);
            }
        });

    });

});

/*
const request = require('supertest');

// Assuming your API is running on http://localhost:3000
const BASE_URL = 'http://localhost:3000';

describe('API Endpoints', () => {
    test('GET /healthcheck - should return status 200', async () => {
        const response = await request(BASE_URL).get('/healthcheck');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });

    test('GET /items - should return a list of items', async () => {
        const response = await request(BASE_URL).get('/items');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /items - should create a new item', async () => {
        const newItem = { name: 'Test Item', quantity: 10 };
        const response = await request(BASE_URL)
            .post('/items')
            .send(newItem)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(newItem.name);
    });

    test('PUT /items/:id - should update an existing item', async () => {
        const updateData = { quantity: 20 };
        const response = await request(BASE_URL)
            .put('/items/1')
            .send(updateData)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body.quantity).toBe(updateData.quantity);
    });

    test('DELETE /items/:id - should delete an item', async () => {
        const response = await request(BASE_URL).delete('/items/1');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Item deleted');
    });
});

 */