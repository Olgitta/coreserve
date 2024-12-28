'use strict';

const { StatusCodes } = require('http-status-codes');

require('../../mocks');

const {
    closeDatabaseConnection: closeDatabaseConnection1,
    connectToDatabase: connectToDatabase1,
    mongodbPing
} = require('../../../src/infra/db/mongodb/connection');
const {
    closeDatabaseConnection,
    connectToDatabase,
    createModel,
    mysqlPing
} = require('../../../src/infra/db/mysql/connection');

jest.mock('../../../src/infra/db/mongodb/connection', () => ({
    connectToDatabase: jest.fn(),
    closeDatabaseConnection: jest.fn(),
    mongodbPing: jest.fn()
}));

jest.mock('../../../src/infra/db/mysql/connection', () => ({
    connectToDatabase: jest.fn(),
    closeDatabaseConnection: jest.fn(),
    mysqlPing: jest.fn(),
    createModel: jest.fn()
}));

const HealthController = require('#apis/health/HealthController.js');

describe('HealthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should enforce singleton behavior', () => {
        const instance1 = HealthController.getInstance();
        const instance2 = HealthController.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should throw an error if instantiated directly', () => {
        expect(() => new HealthController()).toThrowError(
            'HealthController is a singleton. Use HealthController.getInstance() to access the instance.'
        );
    });

    it('should return success response on healthCheck success', async () => {

        mongodbPing.mockResolvedValueOnce();
        mysqlPing.mockResolvedValueOnce();

        const result = await HealthController.healthCheck();

        // Assertions
        expect(mongodbPing).toHaveBeenCalled();
        expect(mysqlPing).toHaveBeenCalled();

        expect(result.statusCode).toEqual(StatusCodes.OK);
    });

    it('should return error response on healthCheck failure', async () => {

        const error = new Error('Database ping failed');
        mongodbPing.mockRejectedValueOnce(error);

        const result = await HealthController.healthCheck();

        // Assertions
        expect(mongodbPing).toHaveBeenCalled();
        expect(mysqlPing).not.toHaveBeenCalled();
        expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});
