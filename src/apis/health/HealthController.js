'use strict';

const {StatusCodes} = require('http-status-codes');
const logger = require('#core/logger/index.js')('HealthController');
const {SuccessHandler, ErrorHandler} = require('#apis/index.js');
const {mongodbPing} = require('../../infra/db/mongodb/connection');
const {mysqlPing} = require('../../infra/db/mysql/connection');

class HealthController {
    static #instance;

    constructor() {
        if (new.target === HealthController) {
            throw new Error('HealthController is a singleton. Use HealthController.getInstance() to access the instance.');
        }
    }

    static getInstance() {
        if (!HealthController.#instance) {
            HealthController.#instance = this;
        }
        return HealthController.#instance;
    }

    static async healthCheck() {
        try {
            logger.info('healthCheck started.');
            await mongodbPing();
            await mysqlPing();
            logger.info('healthCheck finished.');
            return SuccessHandler.handle(StatusCodes.OK,null,'OK')
        } catch (error) {
            logger.error('healthCheck failed...', error);
            return ErrorHandler.handle(error, StatusCodes.INTERNAL_SERVER_ERROR,)
        }
    }
}

module.exports = HealthController;