'use strict';

require('../mocks');
const PaginationBuilder = require('../../src/apis/PaginationBuilder');
const { ValidationError } = require('#core/errors/index.js');

describe('PaginationBuilder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with valid inputs', () => {
            const page = 2;
            const limit = 10;

            const paginationBuilder = new PaginationBuilder(page, limit);

            expect(paginationBuilder.skip).toBe(10);
            expect(paginationBuilder.limit).toBe(10);

        });

        it('should throw ValidationError for invalid inputs', () => {

            expect(() => new PaginationBuilder('invalid', 10)).toThrow(ValidationError);
        });
    });

    describe('setTotal', () => {
        it('should set the total property and return the instance', () => {
            const paginationBuilder = new PaginationBuilder(1, 10);

            const result = paginationBuilder.setTotal(50);

            expect(result).toBe(paginationBuilder);
        });
    });

    describe('setUrl', () => {
        it('should set the url property and return the instance', () => {
            const paginationBuilder = new PaginationBuilder(1, 10);

            const result = paginationBuilder.setUrl('http://example.com');

            expect(result).toBe(paginationBuilder);
        });
    });

    describe('build', () => {
        it('should build pagination metadata correctly', () => {
            const paginationBuilder = new PaginationBuilder(2, 10);
            paginationBuilder.setTotal(50).setUrl('/foo?p1=1');

            const result = paginationBuilder.build();

            expect(result).toEqual({
                total: 50,
                totalPages: 5,
                nextPage: '/foo?p1=1&page=3&limit=10',
                prevPage: '/foo?p1=1&page=1&limit=10',
            });
        });

        it('should throw ValidationError if dataset is invalid', () => {

            const paginationBuilder = new PaginationBuilder(2, 10);
            paginationBuilder.setTotal(null).setUrl(null);

            expect(() => paginationBuilder.build()).toThrow(ValidationError);
        });
    });

    describe('Getter Methods', () => {
        it('should return correct skip and limit values', () => {
            const paginationBuilder = new PaginationBuilder(3, 20);

            expect(paginationBuilder.skip).toBe(40);
            expect(paginationBuilder.limit).toBe(20);
        });
    });
});
