const { StatusCodes } = require('http-status-codes');
const { ApiError, ValidationError, ApiErrorCodes } = require('../../src/core/errors');
const ErrorHandler = require('#apis/ErrorHandler.js');

describe('ErrorHandler', () => {
    beforeEach(() => {
        delete process.env.NODE_ENV; // Reset NODE_ENV before each test
    });

    test('should throw an error if constructor is called directly', () => {
        expect(() => new ErrorHandler()).toThrow('ErrorHandler is a singleton. Use ErrorHandler.getInstance() to access the instance.');
    });

    test('should return the same instance when getInstance is called multiple times', () => {
        const instance1 = ErrorHandler.getInstance();
        const instance2 = ErrorHandler.getInstance();
        expect(instance1).toBe(instance2);
    });

    test('should handle ValidationError with BAD_REQUEST status code', () => {
        const error = new ValidationError('Invalid input');
        const result = ErrorHandler.handleError(error);
        expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(result.error).toBe(error);
    });

    test('should handle generic error with INTERNAL_SERVER_ERROR status code', () => {
        const error = new Error('Generic error');
        const result = ErrorHandler.handleError(error);
        expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(result.error).toBe(error);
    });

    test('should return generic ApiError in production mode', () => {
        process.env.NODE_ENV = 'production';
        const error = new Error('Sensitive error');
        const result = ErrorHandler.handleError(error);
        expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(result.error).toBeInstanceOf(ApiError);
        expect(result.error.message).toBe('Something went wrong, try again later...');
        expect(result.error.code).toBe(ApiErrorCodes.GENERAL_ERROR);
    });

    test('should return the original error in non-production mode', () => {
        process.env.NODE_ENV = 'development';
        const error = new Error('Development error');
        const result = ErrorHandler.handleError(error);
        expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(result.error).toBe(error);
    });
});
