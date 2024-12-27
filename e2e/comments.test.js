'use strict';

const debug = require('debug')('testing');

const request = require('supertest');
const {faker} = require('@faker-js/faker');
const helpers = require('./helpers');

describe('COMMENTS API Endpoints', () => {

    const requestPath = '/comments';
    const jwtToken = helpers.createTestToken();
    const auth = ['Authorization', `Bearer ${jwtToken}`];
    let postId;
    const postsToRemove = [];
    const commentsToRemove = [];

    const createResource = async (commentParenId = null) => {

        let rs = await request(helpers.BASE_URL)
            .post('/posts')
            .send({
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            })
            .set(...auth)
            .set('Content-Type', 'application/json');

        postId = rs.body.resources.id;
        postsToRemove.push(postId);

        rs = await request(helpers.BASE_URL)
            .post(requestPath)
            .send({
                postId: postId,
                parentId: commentParenId,
                content: faker.lorem.paragraph(),
            })
            .set(...auth)
            .set('Content-Type', 'application/json');

        commentsToRemove.push(rs.body.resources.id);

        return rs;
    }

    const createResources = async () => {

        const rs = await request(helpers.BASE_URL)
            .post('/posts')
            .send({
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraph(),
            })
            .set(...auth)
            .set('Content-Type', 'application/json');

        const poi = rs.body.resources.id;
        postsToRemove.push(poi);

        debug(`createResources:created.post.id:${poi}`);

        let parentId;

        for (let i = 0; i < 5; i++) {
            const rs = await request(helpers.BASE_URL)
                .post(requestPath)
                .send({
                    postId: poi,
                    content: faker.lorem.paragraph(),
                })
                .set(...auth)
                .set('Content-Type', 'application/json');

            parentId = rs.body.resources.id; // for replies
            commentsToRemove.push(rs.body.resources.id);

            debug(`createResources:created.comment:`, rs.body.resources);
        }

        for (let i = 0; i < 5; i++) {
            const rs = await request(helpers.BASE_URL)
                .post(requestPath)
                .send({
                    postId: poi,
                    parentId: parentId,
                    content: faker.lorem.paragraph(),
                })
                .set(...auth)
                .set('Content-Type', 'application/json');

            commentsToRemove.push(rs.body.resources.id);

            debug(`createResources:created.reply for comment ${parentId}:`);
        }

        return {
            poi: poi,
            parentId: parentId,
        };
    }

    // Happy Path Tests
    describe('Happy Path Tests', () => {

        test('POST /comments - Create a new comment', async () => {

            // Act
            let response = await createResource();
            let actual = response.body;
            debug('Create a new comment', actual);

            // Assert
            helpers.testStatusCode(response.status, 201);
            helpers.testCommentStructure(actual.resources);
            helpers.testOKMetadataStructure(actual.metadata);

            // Act
            response = await createResource(actual.resources.id);
            actual = response.body;
            debug('Create a reply to a comment', actual);

            // Assert
            helpers.testStatusCode(response.status, 201);
            helpers.testCommentStructure(actual.resources);
            helpers.testOKMetadataStructure(actual.metadata);
        });

        test('POST /comments/like/:id - Increment comment likes', async () => {

            const created = await createResource();
            const id = created.body.resources.id;

            // Act: Increment likes
            const response = await request(helpers.BASE_URL).post(`${requestPath}/like/${id}`).set(...auth);
            const actual = response.body;
            debug('Increment comment likes', actual);
            helpers.testStatusCode(response.status, 200);
            helpers.testOKMetadataStructure(actual.metadata);

            // todo: Assert: Verify the updated likes count
            // const verify = await request(helpers.BASE_URL).get(`${requestPath}/${id}`).set(...auth);
            // expect(verify.body.resources.likes).toEqual(1);
        });

        test('POST /comments/unlike/:id - Decrement comment likes', async () => {

            const created = await createResource();
            const id = created.body.resources.id;

            // Act: Increment likes
            await request(helpers.BASE_URL).post(`${requestPath}/like/${id}`).set(...auth);

            // Act: Decrement likes
            const response = await request(helpers.BASE_URL).post(`${requestPath}/unlike/${id}`).set(...auth);
            const actual = response.body;
            debug('Decrement comment likes', actual);
            helpers.testStatusCode(response.status, 200);
            helpers.testOKMetadataStructure(actual.metadata);

        });

        test('GET /comments - Fetch paginated comments', async () => {
            // Arrange: Populate the comments
            const {poi} = await createResources();

            // Act: Fetch the comments
            const response = await request(helpers.BASE_URL).get(requestPath).query({
                page: 2,
                limit: 2,
                postId: poi,
            }).set(...auth);
            const actual = response.body;
            debug('Fetch paginated comments', actual);

            // Assert
            helpers.testStatusCode(response.status, 200);
            helpers.testOKMetadataStructure(actual.metadata);
            expect(actual.resources).toBeInstanceOf(Array);
            expect(actual.resources.length).toEqual(2);
            helpers.testCommentStructure(actual.resources[0]);

            helpers.testPaginationStructure(actual.pagination);
            expect(actual.pagination.total).toBeGreaterThan(0);
            expect(actual.pagination.totalPages).toBeGreaterThan(0);
            expect(actual.pagination.prevPage).not.toBeUndefined();
            expect(actual.pagination.nextPage).not.toBeUndefined();
        });

        test('GET /comments - Fetch paginated replies to comment', async () => {
            // Arrange: Populate the replies
            const {poi, parentId} = await createResources();

            // Act: Fetch the replies
            const response = await request(helpers.BASE_URL).get(requestPath).query({
                page: 2,
                limit: 2,
                postId: poi,
                parentId: parentId,
            }).set(...auth);
            const actual = response.body;
            debug('Fetch paginated replies', actual);

            // Assert
            helpers.testStatusCode(response.status, 200);
            helpers.testOKMetadataStructure(actual.metadata);
            expect(actual.resources).toBeInstanceOf(Array);
            expect(actual.resources.length).toEqual(2);
            helpers.testCommentStructure(actual.resources[0]);

            helpers.testPaginationStructure(actual.pagination);
            expect(actual.pagination.total).toBeGreaterThan(0);
            expect(actual.pagination.totalPages).toBeGreaterThan(0);
            expect(actual.pagination.prevPage).not.toBeUndefined();
            expect(actual.pagination.nextPage).not.toBeUndefined();
        });


        test('DELETE /comments/:id - Delete comments by ID', async () => {
            // Act & Assert: Delete all tracked comments
            for (const id of commentsToRemove) {
                const response = await request(helpers.BASE_URL).delete(`${requestPath}/${id}`).set(...auth);
                debug('Delete comment by ID', response.body);
                helpers.testStatusCode(response.status, 200);
                helpers.testOKMetadataStructure(response.body.metadata);
            }

            // Delete all tracked posts
            for (const id of postsToRemove) {
                const response = await request(helpers.BASE_URL).delete(`posts/${id}`).set(...auth);
                debug(`Delete post by ID:${id}`);
            }
        });

    });

    describe('Negative Path Tests', () => {

        describe('Invalid Input Tests', () => {

            test('POST /comments - Create a new comment should respond with 400', async () => {
                const created = await createResource();

                // Act: invalid content
                const rs1 = await request(helpers.BASE_URL)
                    .post(requestPath)
                    .send({
                        postId: postId,
                        content: '',
                    })
                    .set(...auth)
                    .set('Content-Type', 'application/json');
                const actual1 = rs1.body;
                debug('Invalid content', actual1);

                // Act: invalid postId
                const rs2 = await request(helpers.BASE_URL)
                    .post(requestPath)
                    .send({
                        content: faker.lorem.paragraph(),
                    })
                    .set(...auth)
                    .set('Content-Type', 'application/json');
                const actual2 = rs2.body;
                debug('Invalid postId', actual2);

                // Assert
                helpers.testStatusCode(rs1.status, 400);
                helpers.testStatusCode(rs2.status, 400);
                helpers.test400MetadataStructure(actual1.metadata);
                helpers.test400MetadataStructure(actual2.metadata);
            });

            test('GET /comments - Fetch paginated comments should respond with 400', async () => {
                const response = await request(helpers.BASE_URL).get(requestPath).query({
                    page: '210invalid',
                    limit: 2
                }).set(...auth);
                const actual = response.body;
                debug('Fetch paginated comments', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);
            });

            test('DELETE /comments/:id - Delete comments by ID should respond with 400', async () => {
                const response = await request(helpers.BASE_URL).delete(`${requestPath}/invalidid`).set(...auth);
                const actual = response.body;
                debug('Invalid id', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);
            });

            test('POST /comments/like/:id - Increment comment likes should respond with 400', async () => {

                const response = await request(helpers.BASE_URL).post(`${requestPath}/like/invalid_id`).set(...auth);
                const actual = response.body;
                debug('Increment comment likes', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);

            });

            test('POST /comments/unlike/:id - Decrement comment likes should respond with 400', async () => {

                const response = await request(helpers.BASE_URL).post(`${requestPath}/unlike/10invalid`).set(...auth);
                const actual = response.body;
                debug('Decrement comment likes', actual);
                helpers.testStatusCode(response.status, 400);
                helpers.test400MetadataStructure(actual.metadata);

            });

        });

    });
});
