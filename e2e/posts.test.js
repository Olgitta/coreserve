const request = require('supertest');
const { faker } = require('@faker-js/faker');

const {
    BASE_URL,
    testStatusAndTraceId,
    testPostStructure
} = require('./helpers');

describe('POSTS API Endpoints', () => {

    // Happy Path Tests
    describe('Happy Path Tests', () => {

        const toRemove = []; // Track IDs for cleanup after tests

        test('POST /posts - Create a new post', async () => {
            // Arrange
            const newItem = {
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            };

            // Act
            const response = await request(BASE_URL)
                .post('/posts')
                .send(newItem)
                .set('Content-Type', 'application/json');
            const actual = response.body;

            // Assert
            testStatusAndTraceId(response.status, actual.metadata.traceId, 201);
            testPostStructure(actual.resources);
            expect(actual.resources.title).toEqual(newItem.title);
            expect(actual.resources.content).toEqual(newItem.content);
            expect(actual.resources.likes).toEqual(0);

            // Track the created post for cleanup
            toRemove.push(actual.resources.id);
        });

        test('POST /posts/like/:id - Increment post likes', async () => {
            // Arrange
            const newItem = {
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            };

            // Act: Create a new post
            let response = await request(BASE_URL)
                .post('/posts')
                .send(newItem)
                .set('Content-Type', 'application/json');
            const id = response.body.resources.id;

            // Act: Increment likes
            response = await request(BASE_URL).post(`/posts/like/${id}`);
            testStatusAndTraceId(response.status, response.body.metadata.traceId, 200);

            // Assert: Verify the updated likes count
            response = await request(BASE_URL).get(`/posts/${id}`);
            const actual = response.body;
            expect(actual.resources.likes).toEqual(1);

            // Track the created post for cleanup
            toRemove.push(id);
        });

        test('POST /posts/unlike/:id - Decrement post likes', async () => {
            // Arrange
            const newItem = {
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            };

            // Act: Create a new post and increment likes
            let response = await request(BASE_URL)
                .post('/posts')
                .send(newItem)
                .set('Content-Type', 'application/json');
            const id = response.body.resources.id;

            response = await request(BASE_URL).post(`/posts/like/${id}`);
            testStatusAndTraceId(response.status, response.body.metadata.traceId, 200);

            // Verify increment
            response = await request(BASE_URL).get(`/posts/${id}`);
            let actual = response.body;
            expect(actual.resources.likes).toEqual(1);

            // Act: Decrement likes
            response = await request(BASE_URL).post(`/posts/unlike/${id}`);
            testStatusAndTraceId(response.status, response.body.metadata.traceId, 200);

            // Assert: Verify decrement
            response = await request(BASE_URL).get(`/posts/${id}`);
            actual = response.body;
            expect(actual.resources.likes).toEqual(0);

            // Track the created post for cleanup
            toRemove.push(id);
        });

        test('PUT /posts/:id - Update an existing post', async () => {
            // Arrange: Create a new post
            const newItem = {
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            };
            const created = await request(BASE_URL)
                .post('/posts')
                .send(newItem)
                .set('Content-Type', 'application/json');
            const id = created.body.resources.id;

            const updateData = {
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            };

            // Act: Update the post
            const response = await request(BASE_URL)
                .put(`/posts/${id}`)
                .send(updateData)
                .set('Content-Type', 'application/json');
            const actual = response.body;

            // Assert
            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            testPostStructure(actual.resources);
            expect(actual.resources.title).toEqual(updateData.title);
            expect(actual.resources.content).toEqual(updateData.content);

            // Track the updated post for cleanup
            toRemove.push(id);
        });

        test('GET /posts - Fetch paginated posts', async () => {
            // Act: Fetch the posts
            const response = await request(BASE_URL).get('/posts').query({ page: 1, limit: 10 });
            const actual = response.body;

            // Assert
            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            expect(actual.resources).toBeInstanceOf(Array);
            expect(actual.pagination.totalPages).toBeGreaterThan(0);
            testPostStructure(actual.resources[0]);
        });

        test('GET /posts/:id - Fetch post by ID', async () => {
            // Arrange: Create a new post
            const newItem = {
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            };
            const created = await request(BASE_URL)
                .post('/posts')
                .send(newItem)
                .set('Content-Type', 'application/json');
            const id = created.body.resources.id;

            // Act: Fetch the post by ID
            const response = await request(BASE_URL).get(`/posts/${id}`);
            const actual = response.body;

            // Assert
            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            testPostStructure(actual.resources);
            expect(actual.resources.title).toEqual(newItem.title);
            expect(actual.resources.content).toEqual(newItem.content);

            // Track the fetched post for cleanup
            toRemove.push(id);
        });

        test('DELETE /posts/:id - Delete posts by ID', async () => {
            // Act & Assert: Delete all tracked posts
            for (const id of toRemove) {
                const response = await request(BASE_URL).delete(`/posts/${id}`);
                testStatusAndTraceId(response.status, response.body.metadata.traceId, 200);
            }
        });

    });

});
