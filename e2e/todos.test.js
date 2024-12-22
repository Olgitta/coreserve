const request = require('supertest');
const {
    BASE_URL,
    testStatusAndTraceId,
    testTodoStructure,
    loremIpsum
} = require('./helpers');

describe('TODOS API Endpoints', () => {
    // Grouping tests for the "happy path"
    describe('Happy Path Scenarios', () => {
        const toRemove = []; // Track created items to clean up after tests

        test('POST /todos - successfully creates a new todo item', async () => {
            // Arrange: Prepare a new todo item
            const newItem = {title: loremIpsum.getLoremIpsum().title};

            // Act: Send a POST request to create the todo
            const response = await request(BASE_URL)
                .post('/todos')
                .send(newItem)
                .set('Content-Type', 'application/json');

            const actual = response.body;

            // Assert: Check the status, structure, and content of the response
            testStatusAndTraceId(response.status, actual.metadata.traceId, 201);
            testTodoStructure(actual.resources);
            expect(actual.resources.title).toEqual(newItem.title);

            // Cleanup: Add the created item's ID to the removal list
            toRemove.push(actual.resources.id);
        });

        test('PUT /todos/:id - successfully updates an existing todo item', async () => {
            // Arrange: Create a new todo item
            const newItem = {title: loremIpsum.getLoremIpsum().title};
            const created = await request(BASE_URL)
                .post('/todos')
                .send(newItem)
                .set('Content-Type', 'application/json');
            const id = created.body.resources.id;

            // Prepare the update data
            const updateData = {title: loremIpsum.getLoremIpsum(1).title, completed: true};

            // Act: Send a PUT request to update the todo
            const response = await request(BASE_URL)
                .put(`/todos/${id}`)
                .send(updateData)
                .set('Content-Type', 'application/json');

            const actual = response.body;

            // Assert: Validate the response structure and updated content
            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            testTodoStructure(actual.resources);
            expect(actual.resources.title).toEqual(updateData.title);
            expect(actual.resources.completed).toEqual(updateData.completed);

            // Cleanup: Add the updated item's ID to the removal list
            toRemove.push(id);
        });

        test('GET /todos - retrieves a paginated list of todos', async () => {
            // Act: Send a GET request with pagination parameters
            const response = await request(BASE_URL).get('/todos').query({page: 1, limit: 10});
            const actual = response.body;

            // Assert: Validate the response structure and pagination details
            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            expect(actual.resources).toBeInstanceOf(Array);
            expect(actual.pagination.totalPages).toBeGreaterThan(0);
            testTodoStructure(actual.resources[0]);
        });

        test('GET /todos/:id - retrieves details of a specific todo item', async () => {
            // Arrange: Create a new todo item
            const newItem = {title: loremIpsum.getLoremIpsum().title};
            const created = await request(BASE_URL)
                .post('/todos')
                .send(newItem)
                .set('Content-Type', 'application/json');
            const id = created.body.resources.id;

            // Act: Send a GET request to fetch the todo by ID
            const response = await request(BASE_URL).get(`/todos/${id}`);
            const actual = response.body;

            // Assert: Validate the response structure and content
            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            testTodoStructure(actual.resources);
            expect(actual.resources.title).toEqual(newItem.title);

            // Cleanup: Add the fetched item's ID to the removal list
            toRemove.push(id);
        });

        test('DELETE /todos/:id - successfully deletes todo items created during tests', async () => {
            // Cleanup: Iterate over tracked IDs and delete each todo
            for (const id of toRemove) {
                const response = await request(BASE_URL).delete(`/todos/${id}`);
                testStatusAndTraceId(response.status, response.body.metadata.traceId, 200);
            }
        });
    });
});
