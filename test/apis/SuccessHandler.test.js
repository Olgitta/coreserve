'use strict';

const { StatusCodes } = require('http-status-codes');
const SuccessHandler = require('#apis/SuccessHandler.js');

describe('SuccessHandler', () => {
    describe('getInstance', () => {
        it('should return the singleton instance of SuccessHandler', () => {
            const instance1 = SuccessHandler.getInstance();
            const instance2 = SuccessHandler.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('should throw an error if the constructor is called directly', () => {
            expect(() => new SuccessHandler()).toThrow(
                'SuccessHandler is a singleton. Use SuccessHandler.getInstance() to access the instance.'
            );
        });
    });

    describe('handle', () => {
        it('should return a success response with default status code', () => {
            const result = SuccessHandler.handle(null, { data: 'test' }, 'Operation successful');

            expect(result).toEqual({
                statusCode: StatusCodes.OK,
                resources: { data: 'test' },
                message: 'Operation successful',
            });
        });

        it('should return a success response with a provided status code', () => {
            const result = SuccessHandler.handle(StatusCodes.CREATED, { id: 1 }, 'Resource created');

            expect(result).toEqual({
                statusCode: StatusCodes.CREATED,
                resources: { id: 1 },
                message: 'Resource created',
            });
        });
    });

    describe('handleWithPagination', () => {
        it('should return a success response with pagination data', () => {
            const pagination = { total: 100, totalPages: 10, nextPage: 'next', prevPage: 'prev' };
            const result = SuccessHandler.handleWithPagination(StatusCodes.OK, { items: [] }, 'Success', pagination);

            expect(result).toEqual({
                statusCode: StatusCodes.OK,
                resources: { items: [] },
                message: 'Success',
                pagination,
            });
        });

        it('should return a success response with an empty pagination object', () => {
            const result = SuccessHandler.handleWithPagination(StatusCodes.OK, { items: [] }, 'Success', null);

            expect(result).toEqual({
                statusCode: StatusCodes.OK,
                resources: { items: [] },
                message: 'Success',
                pagination: null,
            });
        });
    });
});
