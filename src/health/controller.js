'use strict';

const debug = require('debug')('coreserve:healthcheck');
const log = require('../core/logger');
const mongodbPing = require('../infra/db/mongodb/connection').pingDatabase;
const mysqlPing = require('../infra/db/mysql/connection').pingDatabase;

module.exports = function getHealthCheckController() {

    return {
        async healthCheck() {
            try {
                debug('healthCheck started.');
                await mongodbPing();
                await mysqlPing();
                debug('healthCheck finished.');
                return {};
            } catch (error) {
                log.error('healthCheck failed...', error);
                return {error: error};
            }
        }
    }
};

