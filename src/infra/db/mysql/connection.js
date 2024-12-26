'use strict';

const logger = require('#core/logger/index.js')('MySqlConnection');
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

        logger.info(`Connected to MySql: ${host}/${database}`);
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
        logger.info('Closing MySql...');
        await sequelize.close();
        logger.info('MySql closed.');
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
