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
            // Arrange: Populate the posts
            for(let i=0; i<=5; i++) {
                const response = await request(BASE_URL)
                    .post('/posts')
                    .send({
                        title: faker.lorem.sentence(),
                        content: faker.lorem.paragraph(),
                    })
                    .set('Content-Type', 'application/json');
                toRemove.push(response.body.resources.id);
            }

            // Act: Fetch the posts
            const response = await request(BASE_URL).get('/posts').query({ page: 2, limit: 2 });
            const actual = response.body;

            // Assert
            testStatusAndTraceId(response.status, actual.metadata.traceId, 200);
            expect(actual.resources).toBeInstanceOf(Array);
            expect(actual.resources.length).toEqual(2);
            testPostStructure(actual.resources[0]);

            expect(actual.pagination.totalPages).toBeGreaterThan(0);
            expect(actual.pagination.prevPage).not.toBeUndefined();
            expect(actual.pagination.nextPage).not.toBeUndefined();
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

    describe('Negative Path Tests', () => {

        const toRemove = [];

        describe('Invalid Input Tests', () => {

            test('POST /posts - Create a new post should respond with 400', async () => {
                // Act: invalid title
                const rs1 = await request(BASE_URL)
                    .post('/posts')
                    .send({
                        title: '',
                        content: faker.lorem.paragraph(1),
                    })
                    .set('Content-Type', 'application/json');
                const actual1 = rs1.body;

                // Act: invalid content
                const rs2 = await request(BASE_URL)
                    .post('/posts')
                    .send({
                        title: faker.lorem.sentence(2),
                        content: faker.number.int(),
                    })
                    .set('Content-Type', 'application/json');
                const actual2 = rs2.body;

                // Assert
                testStatusAndTraceId(rs1.status, actual1.metadata.traceId, 400);
                testStatusAndTraceId(rs2.status, actual2.metadata.traceId, 400);

            });

            test('GET /posts/:id - Fetch post by ID should respond with 400', async () => {
                const response = await request(BASE_URL).get(`/posts/777invalid`);
                testStatusAndTraceId(response.status, response.body.metadata.traceId, 400);
            });

            test('DELETE /posts/:id - Delete posts by ID should respond with 400', async () => {
                const response = await request(BASE_URL).delete(`/posts/invalidid`);
                testStatusAndTraceId(response.status, response.body.metadata.traceId, 400);
            });


        });



    });
});
