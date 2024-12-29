'use strict';

const { updateQueryParams } = require('#core/utils/urlUtils.js');

describe('Test urlUtils: updateQueryParams', () => {
    it('should add new query parameters to the URL', () => {
        const url = '/path_url?p1=1';
        const payload = { p2: 2, page: 1 };
        const result = updateQueryParams(url, payload);

        expect(result).toBe('/path_url?p1=1&p2=2&page=1');
    });

    it('should update existing query parameters in the URL', () => {
        const url = '/path_url?p1=1&page=1';
        const payload = { page: 2, limit: 10 };
        const result = updateQueryParams(url, payload);

        expect(result).toBe('/path_url?p1=1&page=2&limit=10');
    });

    it('should work with an empty payload', () => {
        const url = '/path_url?p1=1&page=1';
        const payload = {};
        const result = updateQueryParams(url, payload);

        expect(result).toBe('/path_url?p1=1&page=1');
    });

    it('should handle a URL without query parameters', () => {
        const url = '/path_url';
        const payload = { page: 1, limit: 10 };
        const result = updateQueryParams(url, payload);

        expect(result).toBe('/path_url?page=1&limit=10');
    });

    it('should handle an empty URL and payload', () => {
        const url = '/';
        const payload = {};
        const result = updateQueryParams(url, payload);

        expect(result).toBe('/');
    });

    xit('should properly encode special characters in query parameters', () => {
        const url = '/path_url';
        const payload = { 'a key': 'a value with spaces', 'symbol': '&value' };
        const result = updateQueryParams(url, payload);

        expect(result).toBe('/path_url?a%20key=a%20value%20with%20spaces&symbol=%26value');
    });
});
