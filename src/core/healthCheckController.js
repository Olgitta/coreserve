'use strict';

const debug = require('debug')('coreserve:healthcheck');
const log = require('./logger');
const {pingDatabase} = require('../infra/db/mongodb/connection');

module.exports = function getHealthCheckController() {

    return {
        async healthCheck() {
            try {
                debug('healthCheck started.');
                await pingDatabase();
                debug('healthCheck finished.');
                return {};
            } catch (error) {
                log.error('healthCheck failed...', error);
                return {error: error};
            }
        }
    }
};

