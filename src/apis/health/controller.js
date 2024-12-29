'use strict';

const logger = require('../../core/logger')('HealthCheckController');
const mongodbPing = require('../../infra/db/mongodb/connection').pingDatabase;
const mysqlPing = require('../../infra/db/mysql/connection').pingDatabase;

//todo: standartize controller and move its route here
module.exports = function getHealthCheckController() {

    return {
        async healthCheck() {
            try {
                logger.info('healthCheck started.');
                await mongodbPing();
                await mysqlPing();
                logger.info('healthCheck finished.');
                return {};
            } catch (error) {
                logger.error('healthCheck failed...', error);
                return {error: error};
            }
        }
    }
};

