const ResponseBuilder = require('#apis/ResponseBuilder.js');

describe('ResponseBuilder', () => {
    let builder;

    beforeEach(() => {
        builder = new ResponseBuilder();
    });

    test('should initialize with default response structure', () => {
        const response = builder.build();
        expect(response).toEqual({
            metadata: {
                traceId: '',
            },
        });
    });

    test('should set trace ID correctly', () => {
        const traceId = '12345';
        const response = builder.setTraceId(traceId).build();
        expect(response.metadata.traceId).toBe(traceId);
    });

    test('should set error correctly', () => {
        const error = { message: 'An error occurred', code: 500 };
        const response = builder.setError(error).build();
        expect(response.metadata.error).toEqual(error);
    });

    test('should ignore setting error when no error is provided', () => {
        const response = builder.setError(null).build();
        expect(response.metadata).not.toHaveProperty('error');
    });

    test('should set resources correctly', () => {
        const resources = [{ id: 1, name: 'Resource 1' }, { id: 2, name: 'Resource 2' }];
        const response = builder.setResources(resources).build();
        expect(response.resources).toEqual(resources);
    });

    test('should not set resources when null or undefined', () => {
        const response = builder.setResources(null).build();
        expect(response).not.toHaveProperty('resources');
    });

    test('should set pagination correctly', () => {
        const pagination = {
            total: 100,
            totalPages: 10,
            prevPage: 'prevPageUrl',
            nextPage: 'nextPageUrl',
        };
        const response = builder.setPagination(pagination).build();
        expect(response.pagination).toEqual(pagination);
    });

    test('should not set pagination when null or undefined', () => {
        const response = builder.setPagination(null).build();
        expect(response).not.toHaveProperty('pagination');
    });

    test('should set message correctly', () => {
        const message = 'Success';
        const response = builder.setMessage(message).build();
        expect(response.metadata.message).toBe(message);
    });
});
