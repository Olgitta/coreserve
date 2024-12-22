'use strict';

const { StatusCodes } = require('http-status-codes');
const {
    createPost,
    deletePost,
    getPostsWithPagination,
    getPostById,
    updatePost,
    updateLikes,
} = require('../../src/apis/posts/crud');
const PostsController = require('../../src/apis/posts/controller');
const log = require('../../src/core/logger');
const { getCtx } = require('../../src/core/execution-context/context');
const getConfiguration = require('../../src/config/configuration');
const { PaginationBuilder, normalizePaginationParams } = require('../../src/pagination');

jest.mock('../../src/apis/posts/crud', () => ({
    createPost: jest.fn(),
    deletePost: jest.fn(),
    getPostsWithPagination: jest.fn(),
    getPostById: jest.fn(),
    updatePost: jest.fn(),
    updateLikes: jest.fn(),
}));

jest.mock('../../src/core/logger', () => ({
    error: jest.fn(),
}));

jest.mock('../../src/core/execution-context/context', () => ({
    getCtx: jest.fn(),
}));

jest.mock('../../src/config/configuration', () => jest.fn());

jest.mock('../../src/pagination', () => ({
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

describe('PostsController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a post and return the created resource', async () => {
            const payload = { title: 'Post Title', content: 'Post Content' };
            const mockPost = { id: 1, ...payload };
            createPost.mockResolvedValue(mockPost);

            const result = await PostsController.create(payload.title, payload.content);

            expect(createPost).toHaveBeenCalledWith(payload);
            expect(result).toEqual({ statusCode: StatusCodes.CREATED, resources: mockPost });
        });

        it('should return BAD_REQUEST if title or content is invalid', async () => {
            const result = await PostsController.create('', '');

            expect(log.error).toHaveBeenCalledWith('Posts Controller:create:invalid input');
            expect(result).toEqual({ statusCode: StatusCodes.BAD_REQUEST });
        });
    });

    describe('getAll', () => {
        it('should return paginated posts with pagination metadata', async () => {
            getCtx.mockReturnValue({ request: { url: '/posts?page=1' } });
            getConfiguration.mockReturnValue({ posts: { limit: 10 } });
            normalizePaginationParams.mockReturnValue({ page: 1, limit: 10 });
            getPostsWithPagination.mockResolvedValue({ posts: [], total: 0 });

            const result = await PostsController.getAll({ page: 1, limit: 10 });

            expect(getPostsWithPagination).toHaveBeenCalledWith(0, 10);
            expect(result).toEqual({
                statusCode: StatusCodes.OK,
                resources: [],
                pagination: { totalPages: 1, nextPage: null, prevPage: null },
            });
        });
    });

    describe('getById', () => {
        it('should return a post by id', async () => {
            const mockPost = { id: 1, title: 'Post Title', content: 'Post Content' };
            getPostById.mockResolvedValue(mockPost);

            const result = await PostsController.getById(1);

            expect(getPostById).toHaveBeenCalledWith(1);
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: mockPost });
        });

        it('should return NOT_FOUND if post does not exist', async () => {
            getPostById.mockResolvedValue(null);

            const result = await PostsController.getById(999);

            expect(getPostById).toHaveBeenCalledWith(999);
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });

    describe('remove', () => {
        it('should delete a post by id and return the deleted resource', async () => {
            const mockPost = { id: 1, title: 'Post Title', content: 'Post Content' };
            deletePost.mockResolvedValue(mockPost);

            const result = await PostsController.remove(1);

            expect(deletePost).toHaveBeenCalledWith(1);
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: mockPost });
        });

        it('should return NOT_FOUND if post does not exist', async () => {
            deletePost.mockResolvedValue(null);

            const result = await PostsController.remove(999);

            expect(deletePost).toHaveBeenCalledWith(999);
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });

    describe('update', () => {
        it('should update a post and return the updated resource', async () => {
            const mockPost = { id: 1, title: 'Updated Title', content: 'Updated Content' };
            updatePost.mockResolvedValue(mockPost);

            const result = await PostsController.update(1, { title: 'Updated Title' });

            expect(updatePost).toHaveBeenCalledWith(1, { title: 'Updated Title' });
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: mockPost });
        });

        it('should return NOT_FOUND if post does not exist', async () => {
            updatePost.mockResolvedValue(null);

            const result = await PostsController.update(999, { title: 'Updated Title' });

            expect(updatePost).toHaveBeenCalledWith(999, { title: 'Updated Title' });
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });

    describe('like', () => {
        it('should increment likes for a post', async () => {
            updateLikes.mockResolvedValue(1);

            const result = await PostsController.like(1);

            expect(updateLikes).toHaveBeenCalledWith(1, true);
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: 1 });
        });

        it('should return NOT_FOUND if post does not exist', async () => {
            updateLikes.mockResolvedValue(null);

            const result = await PostsController.like(999);

            expect(updateLikes).toHaveBeenCalledWith(999, true);
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });

    describe('unlike', () => {
        it('should decrement likes for a post', async () => {
            updateLikes.mockResolvedValue(1);

            const result = await PostsController.unlike(1);

            expect(updateLikes).toHaveBeenCalledWith(1, false);
            expect(result).toEqual({ statusCode: StatusCodes.OK, resources: 1 });
        });

        it('should return NOT_FOUND if post does not exist or likes are 0', async () => {
            updateLikes.mockResolvedValue(null);

            const result = await PostsController.unlike(999);

            expect(updateLikes).toHaveBeenCalledWith(999, false);
            expect(result).toEqual({ statusCode: StatusCodes.NOT_FOUND });
        });
    });
});
