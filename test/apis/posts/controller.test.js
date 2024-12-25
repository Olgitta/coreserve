'use strict';

const {StatusCodes} = require('http-status-codes');
const {
    USER_ID, CTX_PAYLOAD,
    CREATE_POST_201, CREATE_POST_400, GET_ALL_200, GET_ALL_400, GET_ALL_200_NO_PAGINATION_PARAMS,
    GET_BY_ID_200, GET_BY_ID_400,
    DELETE_200, DELETE_400,
    UPDATE_200, UPDATE_400,
    LIKE_200, UNLIKE_200, LIKE_UNLIKE_400
} = require('../helpers');

const {
    createPost,
    deletePost,
    getPostsWithPagination,
    getPostById,
    updatePost,
    updateLikes,
} = require('../../../src/apis/posts/crud');
const PostsController = require('../../../src/apis/posts/controller');
const {createCtx, getCtx, getTraceId, getUser, updateUser} = require('../../../src/core/execution-context/context');
const getConfiguration = require('../../../src/config/configuration');
const log = require('../../../src/core/logger')();

jest.mock('../../../src/core/logger', () => {
    return jest.fn(() => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }));
});

jest.mock('../../../src/apis/posts/crud', () => ({
    createPost: jest.fn(),
    deletePost: jest.fn(),
    getPostsWithPagination: jest.fn(),
    getPostById: jest.fn(),
    updatePost: jest.fn(),
    updateLikes: jest.fn(),
}));

jest.mock('../../../src/core/execution-context/context', () => {
    const {USER_ID, CTX_PAYLOAD} = require('../helpers');

    return {
        getUser: jest.fn().mockReturnValue({userId: USER_ID}),
        getCtx: jest.fn().mockReturnValue(CTX_PAYLOAD),
    }
});

jest.mock('../../../src/config/configuration', () => jest.fn());

describe('PostsController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should return OK , create a post and return the created resource', async () => {

            const {crudReceives, crudReturns, expected, request} = CREATE_POST_201();

            // crud op
            createPost.mockResolvedValue(crudReturns);
            const actual = await PostsController.create(request);

            // crud op
            expect(createPost).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST if title or content is invalid', async () => {

            const {expected, request} = CREATE_POST_400();

            const actual = await PostsController.create(request);

            //crud op
            expect(createPost).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('getAll', () => {
        it('should return OK and paginated posts with pagination metadata', async () => {

            const {
                configMock,
                contextMock,
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_ALL_200();

            getCtx.mockReturnValue(contextMock);
            getConfiguration.mockReturnValue(configMock);

            // crud op
            getPostsWithPagination.mockResolvedValue(crudReturns);

            const actual = await PostsController.getAll(request);

            // crud op
            expect(getPostsWithPagination).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should return OK and paginated posts with first page when page and limit not provided', async () => {

            const {
                configMock,
                contextMock,
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_ALL_200_NO_PAGINATION_PARAMS();

            getCtx.mockReturnValue(contextMock);
            getConfiguration.mockReturnValue(configMock);

            // crud op
            getPostsWithPagination.mockResolvedValue(crudReturns);

            const actual = await PostsController.getAll(request);

            // crud op
            expect(getPostsWithPagination).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should return BAD_REQUEST on invalid input', async () => {

            const {
                configMock,
                contextMock,
                expected,
                request
            } = GET_ALL_400();

            getCtx.mockReturnValue(contextMock);
            getConfiguration.mockReturnValue(configMock);

            const actual = await PostsController.getAll(request);

            // crud op
            expect(getPostsWithPagination).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toBeUndefined();
        });
    });

    describe('getById', () => {
        it('should return OK and a post by id', async () => {
            const {
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_BY_ID_200();

            //crud op
            getPostById.mockResolvedValue(crudReturns);

            const actual = await PostsController.getById(request);
            //crud op
            expect(getPostById).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST if called with invalid id', async () => {
            const {expected, request} = GET_BY_ID_400();
            const actual = await PostsController.getById(request);
            //crud op
            expect(getPostById).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

    });

    describe('remove', () => {
        it('should delete a post by id and return the deleted resource', async () => {
            const {
                crudReceives,
                crudReturns,
                expected,
                request
            } = DELETE_200();
            //crud op
            deletePost.mockResolvedValue(crudReturns);

            const actual = await PostsController.remove(request);

            expect(deletePost).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST if called with invalid id', async () => {
            const {expected, request} = DELETE_400();

            const actual = await PostsController.remove(request);

            expect(deletePost).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(actual.statusCode);
        });
    });

    describe('update', () => {
        it('should update a post and return the updated resource', async () => {
            const {
                crudReceives,
                crudReturns,
                expected,
                request
            } = UPDATE_200();

            //crud op
            updatePost.mockResolvedValue(crudReturns);

            const actual = await PostsController.update(request);

            expect(updatePost).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST if called with invalid input', async () => {
            const {expected, request} = UPDATE_400();

            const actual = await PostsController.update(request);

            expect(updatePost).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('likeUnlike', () => {
        it('should increment likes for a post', async () => {
            const {
                crudReceives,
                crudReturns,
                expected,
                request
            } = LIKE_200();
            //crud op
            updateLikes.mockResolvedValue(crudReturns);

            const actual = await PostsController.likeUnlike(request);

            expect(updateLikes).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should decrement likes for a post', async () => {
            const {
                crudReceives,
                crudReturns,
                expected,
                request
            } = UNLIKE_200();

            //crud op
            updateLikes.mockResolvedValue(crudReturns);

            const actual = await PostsController.likeUnlike(request);

            expect(updateLikes).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when called with invalid id', async () => {
            const {
                expected,
                request
            } = LIKE_UNLIKE_400();

            const actual = await PostsController.likeUnlike(request);

            expect(updateLikes).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

});
