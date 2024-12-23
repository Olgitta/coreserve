'use strict';

const { StatusCodes } = require('http-status-codes');
const {faker} = require('@faker-js/faker')
const {
    createComment,
    deleteComment,
    getCommentById,
    getCommentsWithPagination,
    updateLikes
} = require('../../src/apis/comments/crud');
const CommentsController = require('../../src/apis/comments/controller');
const log = require('../../src/core/logger')();
const { getCtx } = require('../../src/core/execution-context/context');
const getConfiguration = require('../../src/config/configuration');
const { PaginationBuilder, normalizePaginationParams } = require('../../src/apis/pagination');

jest.mock('../../src/apis/comments/crud', () => ({
    createComment: jest.fn(),
    deleteComment: jest.fn(),
    getCommentsWithPagination: jest.fn(),
    getCommentById: jest.fn(),
    updateLikes: jest.fn(),
}));

jest.mock('../../src/core/logger', () => {
    return jest.fn(() => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }));
});

jest.mock('../../src/core/execution-context/context', () => ({
    getCtx: jest.fn(),
}));

jest.mock('../../src/config/configuration', () => jest.fn());

jest.mock('../../src/apis/pagination', () => ({
    PaginationBuilder: jest.fn().mockImplementation(() => ({
        setUrl: jest.fn().mockReturnThis(),
        setTotal: jest.fn().mockReturnThis(),
        setLimit: jest.fn().mockReturnThis(),
        setPage: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({
            totalPages: 1,
            nextPage: null,
            prevPage: null,
        }),
    })),
    normalizePaginationParams: jest.fn(),
}));

describe('CommentsController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a comment and return the created resource', async () => {
            const payload = {
                postId: 100,
                content: faker.lorem.paragraph()
            };
            const mockComment = {
                id: 1,
                parentId:null,
                ...payload };

            createComment.mockResolvedValue(mockComment);

            const result = await CommentsController.create(payload);

            expect(createComment).toHaveBeenCalledWith({
                parentId:null,
                ...payload});
            expect(result).toEqual({ statusCode: StatusCodes.CREATED, resources: mockComment });
        });

        it('should create a reply to comment and return the created resource', async () => {
            const payload = { postId: 100, parentId:50, content: faker.lorem.paragraph() };
            const mockComment = { id: 1, parentId:50, ...payload };
            createComment.mockResolvedValue(mockComment);

            const result = await CommentsController.create(payload);

            expect(createComment).toHaveBeenCalledWith(payload);
            expect(result).toEqual({ statusCode: StatusCodes.CREATED, resources: mockComment });
        });

        it('should return BAD_REQUEST if content is invalid', async () => {
            const result = await CommentsController.create({});

            expect(result).toEqual({ statusCode: StatusCodes.BAD_REQUEST });
        });
    });

    describe('getAll', () => {
        it('should return paginated comments with pagination metadata', async () => {
            getCtx.mockReturnValue({ request: { url: '/comments?page=1' } });
            getConfiguration.mockReturnValue({ comments: { limit: 10 } });
            normalizePaginationParams.mockReturnValue({ page: 1, limit: 10 });
            getCommentsWithPagination.mockResolvedValue({ comments: [], total: 0 });

            const result = await CommentsController.getAll({ postId:100, parentId:10, page: 1, limit: 10 });

            expect(getCommentsWithPagination).toHaveBeenCalledWith(100,10,0, 10);
            expect(result).toEqual({
                statusCode: StatusCodes.OK,
                resources: [],
                pagination: { totalPages: 1, nextPage: null, prevPage: null },
            });
        });
    });

    describe('getById', () => {
        it('should return a comment by id', async () => {
            const mockComment = { id: 1, content: faker.lorem.paragraph() };
            getCommentById.mockResolvedValue(mockComment);

            const result = await CommentsController.getById(1);

            expect(getCommentById).toHaveBeenCalledWith(1);
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: mockComment });
        });

        it('should return NOT_FOUND if comment does not exist', async () => {
            getCommentById.mockResolvedValue(null);

            const result = await CommentsController.getById(999);

            expect(getCommentById).toHaveBeenCalledWith(999);
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });

    describe('remove', () => {
        it('should delete a comment by id and return the deleted resource', async () => {
            const mockComment = { id: 1, content: faker.lorem.paragraph() };
            deleteComment.mockResolvedValue(mockComment);

            const result = await CommentsController.remove(1);

            expect(deleteComment).toHaveBeenCalledWith(1);
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: mockComment });
        });

        it('should return NOT_FOUND if comment does not exist', async () => {
            deleteComment.mockResolvedValue(null);

            const result = await CommentsController.remove(999);

            expect(deleteComment).toHaveBeenCalledWith(999);
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });

    describe('like', () => {
        it('should increment likes for a comment', async () => {
            updateLikes.mockResolvedValue(1);

            const result = await CommentsController.like(1);

            expect(updateLikes).toHaveBeenCalledWith(1, true);
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: 1 });
        });

        xit('should return NOT_FOUND if comment does not exist', async () => {
            updateLikes.mockResolvedValue(null);

            const result = await CommentsController.like(999);

            expect(updateLikes).toHaveBeenCalledWith(999, true);
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });

    describe('unlike', () => {
        it('should decrement likes for a comment', async () => {
            updateLikes.mockResolvedValue(1);

            const result = await CommentsController.unlike(1);

            expect(updateLikes).toHaveBeenCalledWith(1, false);
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: 1 });
        });

        xit('should return NOT_FOUND if comment does not exist or likes are 0', async () => {
            updateLikes.mockResolvedValue(null);

            const result = await CommentsController.unlike(999);

            expect(updateLikes).toHaveBeenCalledWith(999, false);
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });
});
