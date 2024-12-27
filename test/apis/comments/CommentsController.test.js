'use strict';

require('../../mocks');

const {
    createComment,
    deleteComment,
    getComments,
    updateLikes
} = require('#apis/comments/crud.js');
const CommentsController = require('#apis/comments/CommentsController.js');

const context = require('#core/execution-context/context.js');
const {
    CREATE_201, CREATE_REPLY_201, CREATE_400,
    DELETE_200, DELETE_400,
    GET_ALL_200, GET_ALL_200_NO_PAGINATION_PARAMS, GET_ALL_200_NO_RECORDS_FOUND, GET_ALL_400,
    LIKE_200, LIKE_UNLIKE_400, UNLIKE_200,
} = require('./helpers');

const getConfiguration = require('#config/configuration.js');

jest.mock('#config/configuration.js', () => jest.fn());

jest.mock('#apis/comments/crud.js', () => ({
    createComment: jest.fn(),
    deleteComment: jest.fn(),
    getComments: jest.fn(),
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

describe('CommentsController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getInstance', () => {
        it('should return the singleton instance of CommentsController', () => {
            const instance1 = CommentsController.getInstance();
            const instance2 = CommentsController.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('should throw an error if the constructor is called directly', () => {
            expect(() => new CommentsController()).toThrow(
                'CommentsController is a singleton. Use CommentsController.getInstance() to access the instance.'
            );
        });
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
            const {
                configMock,
                crudReceives,
                crudReturns,
                expected,
                request} = GET_ALL_200();

            getConfiguration.mockReturnValue(configMock);
            getComments.mockResolvedValue(crudReturns);

            const actual = await CommentsController.getAll(request);

            expect(getComments).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should retrieve the first page of comments when pagination parameters are not provided', async () => {
            const {
                configMock,
                crudReceives,
                crudReturns,
                expected,
                request
            } = GET_ALL_200_NO_PAGINATION_PARAMS();

            getConfiguration.mockReturnValue(configMock);
            getComments.mockResolvedValue(crudReturns);

            const actual = await CommentsController.getAll(request);

            expect(getComments).toHaveBeenCalledWith(...crudReceives);
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
            getComments.mockResolvedValue(crudReturns);

            const actual = await CommentsController.getAll(request);

            expect(getComments).toHaveBeenCalledWith(...crudReceives);
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toEqual(expected.pagination);
        });

        it('should return BAD_REQUEST when invalid input is provided', async () => {
            const {configMock, contextMock, expected, request} = GET_ALL_400();

            context.getCtx.mockReturnValue(contextMock);
            getConfiguration.mockReturnValue(configMock);

            const actual = await CommentsController.getAll(request);

            expect(getComments).not.toHaveBeenCalled();
            expect(actual.statusCode).toEqual(expected.statusCode);
            expect(actual.pagination).toBeUndefined();
        });
    });

    describe('remove', () => {
        it('should successfully delete a comment by id and return the deleted resource', async () => {
            const {
                crudReceives,
                crudReturns,
                expected,
                request} = DELETE_200();

            deleteComment.mockResolvedValue(crudReturns);

            const actual = await CommentsController.remove(request);

            expect(deleteComment).toHaveBeenCalledWith(crudReceives);
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
