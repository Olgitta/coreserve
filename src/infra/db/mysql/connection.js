'use strict';

const debug = require('debug')('coreserve:mysql');
const logger = require('../../../core/logger')('MySqlConnection');
const {Sequelize} = require('sequelize');

let sequelize;

module.exports = {connectToDatabase, closeDatabaseConnection, pingDatabase, createModel};

/**
 *
 * @param config
 * @returns {Promise<void>}
 */
async function connectToDatabase(config) {
    const {host, user, password, database} = config;
    try {

        sequelize = new Sequelize(database, user, password, {
            host: host,
            dialect: 'mysql', // Use 'mysql' for MySQL
            logging: false
        });

        debug(`Connected to MySql: ${host}/${database}`);
    } catch (error) {
        logger.error(`Error connecting to MySql: ${host}/${database}`, error);
        throw error;
    }
}

/**
 *
 * @returns {Promise<void>}
 */
async function closeDatabaseConnection() {
    try {
        debug('Closing MySql...');
        await sequelize.close();
        debug('MySql closed.');
    } catch (error) {
        logger.error('Error disconnecting from MySql:', error);
    }
}

/**
 *
 * @returns {Promise<boolean>}
 */
async function pingDatabase() {
    await sequelize.authenticate();
    return true;
}

function createModel(name, definition, options={}) {
    return sequelize.define(name, definition, options);
}
