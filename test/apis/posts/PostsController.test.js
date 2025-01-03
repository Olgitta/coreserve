'use strict';

require('../../mocks');

const {
    CREATE_201, CREATE_400, GET_ALL_200, GET_ALL_400, GET_ALL_200_NO_PAGINATION_PARAMS,
    GET_BY_ID_200, GET_BY_ID_400,
    DELETE_200, DELETE_400,
    UPDATE_200, UPDATE_400,
    LIKE_200, UNLIKE_200, LIKE_UNLIKE_400, GET_ALL_200_NO_RECORDS_FOUND
} = require('./helpers');

const {
    createPost,
    deletePost,
    getPosts,
    getPostById,
    updatePost,
    updateLikes,
} = require('#apis/posts/crud.js');
const PostsController = require('#apis/posts/PostsController.js');
const context = require('#core/execution-context/context.js');
const getConfiguration = require('#config/configuration.js');

jest.mock('#apis/posts/crud.js', () => ({
    createPost: jest.fn(),
    deletePost: jest.fn(),
    getPosts: jest.fn(),
    getPostById: jest.fn(),
    updatePost: jest.fn(),
    updateLikes: jest.fn(),
}));

jest.mock('#core/execution-context/context.js', () => {
    const {USER_ID, CTX_PAYLOAD} = require('./helpers');

    return {
        getUser: jest.fn().mockReturnValue({userId: USER_ID}),
        getCtx: jest.fn().mockReturnValue(CTX_PAYLOAD),
        getRequestUrl: jest.fn().mockReturnValue(CTX_PAYLOAD.request.url),
    }
});

jest.mock('#config/configuration.js', () => jest.fn());

describe('PostsController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getInstance', () => {
        it('should return the singleton instance of PostsController', () => {
            const instance1 = PostsController.getInstance();
            const instance2 = PostsController.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('should throw an error if the constructor is called directly', () => {
            expect(() => new PostsController()).toThrow(Error);
        });
    });

    describe('create', () => {
        it('should return CREATED and include the created post resource', async () => {
            const {crudReceives, crudReturns, expected, request} = CREATE_201();

            createPost.mockResolvedValue(crudReturns);
            const actual = await PostsController.create(request);

            expect(createPost).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when title or content is invalid', async () => {
            const {expected, request} = CREATE_400();

            const actual = await PostsController.create(request);

            expect(createPost).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('getAll', () => {
        it('should return OK with paginated posts and pagination metadata', async () => {
            const {
                configMock,
                crudReceives,
                crudReturns,
                expected,
                request} = GET_ALL_200();

            getConfiguration.mockReturnValue(configMock);
            getPosts.mockResolvedValue(crudReturns);

            const actual = await PostsController.getAll(request);

            expect(getPosts).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should return OK with paginated posts and default to first page when pagination parameters are not provided', async () => {
            const {
                configMock,
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_ALL_200_NO_PAGINATION_PARAMS();

            getConfiguration.mockReturnValue(configMock);
            getPosts.mockResolvedValue(crudReturns);

            const actual = await PostsController.getAll(request);

            expect(getPosts).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should respond OK when no records found', async () => {
            const {
                configMock,
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_ALL_200_NO_RECORDS_FOUND();

            getConfiguration.mockReturnValue(configMock);
            getPosts.mockResolvedValue(crudReturns);

            const actual = await PostsController.getAll(request);

            expect(getPosts).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should return BAD_REQUEST when input is invalid', async () => {
            const {configMock, expected, request} = GET_ALL_400();

            getConfiguration.mockReturnValue(configMock);

            const actual = await PostsController.getAll(request);

            expect(getPosts).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toBeUndefined();
        });
    });

    describe('getById', () => {
        it('should return OK and the post resource for the specified id', async () => {
            const {crudReceives, crudReturns, expected, request} = GET_BY_ID_200();

            getPostById.mockResolvedValue(crudReturns);

            const actual = await PostsController.getById(request);

            expect(getPostById).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when called with an invalid id', async () => {
            const {expected, request} = GET_BY_ID_400();

            const actual = await PostsController.getById(request);

            expect(getPostById).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('remove', () => {
        it('should delete a post by id and return the deleted resource', async () => {
            const {crudReceives, crudReturns, expected, request} = DELETE_200();

            deletePost.mockResolvedValue(crudReturns);

            const actual = await PostsController.remove(request);

            expect(deletePost).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when called with an invalid id', async () => {
            const {expected, request} = DELETE_400();

            const actual = await PostsController.remove(request);

            expect(deletePost).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('update', () => {
        it('should update a post and return the updated resource', async () => {
            const {crudReceives, crudReturns, expected, request} = UPDATE_200();

            updatePost.mockResolvedValue(crudReturns);

            const actual = await PostsController.update(request);

            expect(updatePost).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when input is invalid', async () => {
            const {expected, request} = UPDATE_400();

            const actual = await PostsController.update(request);

            expect(updatePost).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('likeUnlike', () => {
        it('should increment likes for the specified post', async () => {
            const {crudReceives, crudReturns, expected, request} = LIKE_200();

            updateLikes.mockResolvedValue(crudReturns);

            const actual = await PostsController.likeUnlike(request);

            expect(updateLikes).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should decrement likes for the specified post', async () => {
            const {crudReceives, crudReturns, expected, request} = UNLIKE_200();

            updateLikes.mockResolvedValue(crudReturns);

            const actual = await PostsController.likeUnlike(request);

            expect(updateLikes).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when called with an invalid id', async () => {
            const {expected, request} = LIKE_UNLIKE_400();

            const actual = await PostsController.likeUnlike(request);

            expect(updateLikes).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });
});
