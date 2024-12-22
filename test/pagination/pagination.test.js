const {PaginationBuilder} = require('../../src/pagination');

describe('PaginationBuilder', () => {
    let paginationBuilder;

    beforeEach(() => {
        paginationBuilder = new PaginationBuilder();
    });

    describe('Validation', () => {
        it('should return an empty object if validation fails', () => {
            const result = paginationBuilder.build();
            expect(result).toEqual({});
        });

        it('should return an empty object if url is empty', () => {
            paginationBuilder
                .setUrl('')
                .setTotal(100)
                .setLimit(10)
                .setPage(2);
            const result = paginationBuilder.build();
            expect(result).toEqual({});
        });
    });

    describe('Pagination Logic', () => {
        beforeEach(() => {
            paginationBuilder
                .setUrl('/items')
                .setTotal(100)
                .setLimit(10)
                .setPage(2);
        });

        it('should calculate totalPages correctly', () => {
            const result = paginationBuilder.build();
            expect(result.totalPages).toBe(10);
        });

        it('should return the correct nextPage and prevPage URLs', () => {
            const result = paginationBuilder.build();
            expect(result.nextPage).toBe('/items?page=3&limit=10');
            expect(result.prevPage).toBe('/items?page=1&limit=10');
        });

        it('should handle edge cases for the first and last pages', () => {
            // First page
            paginationBuilder.setPage(1);
            let result = paginationBuilder.build();
            expect(result.prevPage).toBeNull();
            expect(result.nextPage).toBe('/items?page=2&limit=10');

            // Last page
            paginationBuilder.setPage(10);
            result = paginationBuilder.build();
            expect(result.prevPage).toBe('/items?page=9&limit=10');
            expect(result.nextPage).toBeNull();
        });
    });
});
