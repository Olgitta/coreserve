'use strict';

const debug = require('debug')('testing');

const request = require('supertest');
const {faker} = require('@faker-js/faker');
const helpers = require('./helpers');

describe('POSTS API Endpoints', () => {

    const jwtToken = helpers.createTestToken();
    const auth = ['Authorization', `Bearer ${jwtToken}`]

    const createPost = async () => {

        return await request(helpers.BASE_URL)
            .post('/posts')
            .send({
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            })
            .set(...auth)
            .set('Content-Type', 'application/json');
    }

    // Happy Path Tests
    describe('Happy Path Tests', () => {

        const toRemove = []; // Track IDs for cleanup after tests

        test('POST /posts - Create a new post', async () => {

            // Act
            const response = await createPost();
            const actual = response.body;
            debug('Create a new post', actual);

            // Assert
            helpers.testStatusCode(response.status, 201);
            helpers.testPostStructure(actual.resources);
            helpers.testOKMetadataStructure(actual.metadata);

            // Track the created post for cleanup
            toRemove.push(actual.resources.id);
        });

        test('POST /posts/like/:id - Increment post likes', async () => {

            const created = await createPost();
            const id = created.body.resources.id;

            // Act: Increment likes
            const response = await request(helpers.BASE_URL).post(`/posts/like/${id}`).set(...auth);
            const actual = response.body;
            debug('Increment post likes', actual);
            helpers.testStatusCode(response.status, 200);
            helpers.testOKMetadataStructure(actual.metadata);

            // Assert: Verify the updated likes count
            const verify = await request(helpers.BASE_URL).get(`/posts/${id}`).set(...auth);
            expect(verify.body.resources.likes).toEqual(1);

            // Track the created post for cleanup
            toRemove.push(id);
        });

        test('POST /posts/unlike/:id - Decrement post likes', async () => {

            const created = await createPost();
            const id = created.body.resources.id;

            // Act: Increment likes
            await request(helpers.BASE_URL).post(`/posts/like/${id}`).set(...auth);

            // Act: Decrement likes
            const response = await request(helpers.BASE_URL).post(`/posts/unlike/${id}`).set(...auth);
            const actual = response.body;
            debug('Decrement post likes', actual);
            helpers.testStatusCode(response.status, 200);
            helpers.testOKMetadataStructure(actual.metadata);

            // Assert: Verify decrement
            const verify = await request(helpers.BASE_URL).get(`/posts/${id}`).set(...auth);
            expect(verify.body.resources.likes).toEqual(0);

            // Track the created post for cleanup
            toRemove.push(id);
        });

        test('PUT /posts/:id - Update an existing post', async () => {

            const created = await createPost();
            const id = created.body.resources.id;

            // Act: Update the post
            const response = await request(helpers.BASE_URL)
                .put(`/posts/${id}`)
                .send({
                    title: faker.lorem.sentence(),
                    content: faker.lorem.paragraph(),
                })
                .set(...auth)
                .set('Content-Type', 'application/json');
            const actual = response.body;
            debug('Update an existing post', actual);
            // Assert
            helpers.testStatusCode(response.status, 200);
            helpers.testPostStructure(actual.resources);
            helpers.testOKMetadataStructure(actual.metadata);

            // Track the updated post for cleanup
            toRemove.push(id);
        });

        test('GET /posts - Fetch paginated posts', async () => {
            // Arrange: Populate the posts
            for (let i = 0; i <= 5; i++) {
                const response = await createPost();
                toRemove.push(response.body.resources.id);
            }

            // Act: Fetch the posts
            const response = await request(helpers.BASE_URL).get('/posts').query({
                page: 2,
                limit: 2
            }).set(...auth);
            const actual = response.body;
            debug('Fetch paginated posts', actual);

            // Assert
            helpers.testStatusCode(response.status, 200);
            helpers.testOKMetadataStructure(actual.metadata);
            expect(actual.resources).toBeInstanceOf(Array);
            expect(actual.resources.length).toEqual(2);
            helpers.testPostStructure(actual.resources[0]);

            helpers.testPaginationStructure(actual.pagination);
            expect(actual.pagination.total).toBeGreaterThan(0);
            expect(actual.pagination.totalPages).toBeGreaterThan(0);
            expect(actual.pagination.prevPage).not.toBeUndefined();
            expect(actual.pagination.nextPage).not.toBeUndefined();
        });

        test('GET /posts/:id - Fetch post by ID', async () => {

            const created = await createPost();
            const id = created.body.resources.id;
            const createdResource = created.body.resources;

            // Act: Fetch the post by ID
            const response = await request(helpers.BASE_URL).get(`/posts/${id}`).set(...auth);
            const actual = response.body;
            debug('Fetch post by ID', actual);

            // Assert
            helpers.testStatusCode(response.status, 200);
            helpers.testPostStructure(actual.resources);
            helpers.testOKMetadataStructure(actual.metadata);

            // Track the fetched post for cleanup
            toRemove.push(id);
        });

        test('DELETE /posts/:id - Delete posts by ID', async () => {
            // Act & Assert: Delete all tracked posts
            for (const id of toRemove) {
                const response = await request(helpers.BASE_URL).delete(`/posts/${id}`).set(...auth);
                debug('Delete post by ID', response.body);
                helpers.testStatusCode(response.status, 200);
                helpers.testOKMetadataStructure(response.body.metadata);
            }
        });

    });

    describe('Negative Path Tests', () => {

        describe('Invalid Input Tests', () => {

            test('POST /posts - Create a new post should respond with 400', async () => {
                // Act: invalid title
                const rs1 = await request(helpers.BASE_URL)
                    .post('/posts')
                    .send({
                        title: '',
                        content: faker.lorem.paragraph(1),
                    })
                    .set(...auth)
                    .set('Content-Type', 'application/json');
                const actual1 = rs1.body;
                debug('Invalid title', actual1);

                // Act: invalid content
                const rs2 = await request(helpers.BASE_URL)
                    .post('/posts')
                    .send({
                        title: faker.lorem.sentence(2),
                        content: faker.number.int(),
                    })
                    .set(...auth)
                    .set('Content-Type', 'application/json');
                const actual2 = rs2.body;
                debug('Invalid content', actual2);

                // Assert
                helpers.testStatusCode(rs1.status, 400);
                helpers.testStatusCode(rs2.status, 400);
                helpers.test400MetadataStructure(actual1.metadata);
                helpers.test400MetadataStructure(actual2.metadata);
            });

            test('PUT /posts/:id - Update an existing post should respond with 400', async () => {
                const response = await request(helpers.BASE_URL)
                    .put(`/posts/100500`)
                    .send({})
                    .set(...auth)
                    .set('Content-Type', 'application/json');
                const actual = response.body;
                debug('Update an existing post', actual);
                // Assert
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);
            });

            test('GET /posts - Fetch paginated posts should respond with 400', async () => {
                const response = await request(helpers.BASE_URL).get('/posts').query({
                    page: '210invalid',
                    limit: 2
                }).set(...auth);
                const actual = response.body;
                debug('Fetch paginated posts', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);
            });

            test('GET /posts/:id - Fetch post by ID should respond with 400', async () => {
                const response = await request(helpers.BASE_URL).get(`/posts/777invalid`).set(...auth);
                const actual = response.body;
                debug('Invalid id', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);
            });

            test('DELETE /posts/:id - Delete posts by ID should respond with 400', async () => {
                const response = await request(helpers.BASE_URL).delete(`/posts/invalidid`).set(...auth);
                const actual = response.body;
                debug('Invalid id', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);
            });

            test('POST /posts/like/:id - Increment post likes should respond with 400', async () => {

                const response = await request(helpers.BASE_URL).post(`/posts/like/invalid_id`).set(...auth);
                const actual = response.body;
                debug('Increment post likes', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);

            });

            test('POST /posts/unlike/:id - Decrement post likes should respond with 400', async () => {

                const response = await request(helpers.BASE_URL).post(`/posts/unlike/10invalid`).set(...auth);
                const actual = response.body;
                debug('Decrement post likes', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);

            });

        });

    });
});
