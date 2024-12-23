'use strict';

const log = require('../../core/logger')('HealthCheckController');
const mongodbPing = require('../../infra/db/mongodb/connection').pingDatabase;
const mysqlPing = require('../../infra/db/mysql/connection').pingDatabase;

module.exports = function getHealthCheckController() {

    return {
        async healthCheck() {
            try {
                log.info('healthCheck started.');
                await mongodbPing();
                await mysqlPing();
                log.info('healthCheck finished.');
                return {};
            } catch (error) {
                log.error('healthCheck failed...', error);
                return {error: error};
            }
        }
    }
};

