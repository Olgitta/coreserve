'use strict';

const {
    createComment,
    deleteComment,
    getCommentsWithPagination,
    updateLikes
} = require('../../../src/apis/comments/crud');
const CommentsController = require('../../../src/apis/comments/controller');
const log = require('../../../src/core/logger')();
const {createCtx, getCtx, getTraceId, getUser, updateUser} = require('../../../src/core/execution-context/context');
const getConfiguration = require('../../../src/config/configuration');
const {
    CREATE_201, CREATE_REPLY_201, CREATE_400,
    DELETE_200, DELETE_400,
    GET_ALL_200, GET_ALL_200_NO_PAGINATION_PARAMS, GET_ALL_400,
    LIKE_200, LIKE_UNLIKE_400, UNLIKE_200,
} = require("./helpers");

jest.mock('../../../src/apis/comments/crud', () => ({
    createComment: jest.fn(),
    deleteComment: jest.fn(),
    getCommentsWithPagination: jest.fn(),
    updateLikes: jest.fn(),
}));

jest.mock('../../../src/core/logger', () => {
    return jest.fn(() => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }));
});

jest.mock('../../../src/core/execution-context/context', () => {
    const {USER_ID, CTX_PAYLOAD} = require('./helpers');

    return {
        getUser: jest.fn().mockReturnValue({userId: USER_ID}),
        getCtx: jest.fn().mockReturnValue(CTX_PAYLOAD),
    }
});

jest.mock('../../../src/config/configuration', () => jest.fn());

describe('CommentsController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should successfully create a comment and return the created resource', async () => {
            const {crudReceives, crudReturns, expected, request} = CREATE_201();

            createComment.mockResolvedValue(crudReturns);

            const actual = await CommentsController.create(request);

            expect(createComment).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should successfully create a reply to a comment and return the created resource', async () => {
            const {crudReceives, crudReturns, expected, request} = CREATE_REPLY_201();

            createComment.mockResolvedValue(crudReturns);

            const actual = await CommentsController.create(request);

            expect(createComment).toHaveBeenCalledWith(crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when the comment content is invalid', async () => {
            const {expected, request} = CREATE_400();
            const actual = await CommentsController.create(request);

            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('getAll', () => {
        it('should retrieve paginated comments with pagination metadata successfully', async () => {
            const {configMock, contextMock, crudReceives, crudReturns, expected, request} = GET_ALL_200();

            getCtx.mockReturnValue(contextMock);
            getConfiguration.mockReturnValue(configMock);
            getCommentsWithPagination.mockResolvedValue(crudReturns);

            const actual = await CommentsController.getAll(request);

            expect(getCommentsWithPagination).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should retrieve the first page of comments when pagination parameters are not provided', async () => {
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
            getCommentsWithPagination.mockResolvedValue(crudReturns);

            const actual = await CommentsController.getAll(request);

            expect(getCommentsWithPagination).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should return BAD_REQUEST when invalid input is provided', async () => {
            const {configMock, contextMock, expected, request} = GET_ALL_400();

            getCtx.mockReturnValue(contextMock);
            getConfiguration.mockReturnValue(configMock);

            const actual = await CommentsController.getAll(request);

            expect(getCommentsWithPagination).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toBeUndefined();
        });
    });

    describe('remove', () => {
        it('should successfully delete a comment by id and return the deleted resource', async () => {
            const {crudReceives, crudReturns, expected, request} = DELETE_200();

            deleteComment.mockResolvedValue(crudReturns);

            const actual = await CommentsController.remove(request);

            expect(deleteComment).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when attempting to delete a comment with an invalid id', async () => {
            const {expected, request} = DELETE_400();

            const actual = await CommentsController.remove(request);

            expect(deleteComment).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });

    describe('likeUnlike', () => {
        it('should increment the likes count for a comment successfully', async () => {
            const {crudReceives, crudReturns, expected, request} = LIKE_200();

            updateLikes.mockResolvedValue(crudReturns);

            const actual = await CommentsController.likeUnlike(request);

            expect(updateLikes).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should decrement the likes count for a comment successfully', async () => {
            const {crudReceives, crudReturns, expected, request} = UNLIKE_200();

            updateLikes.mockResolvedValue(crudReturns);

            const actual = await CommentsController.likeUnlike(request);

            expect(updateLikes).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
        });

        it('should return BAD_REQUEST when liking or unliking with an invalid comment id', async () => {
            const {expected, request} = LIKE_UNLIKE_400();

            const actual = await CommentsController.likeUnlike(request);

            expect(updateLikes).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
        });
    });
});
