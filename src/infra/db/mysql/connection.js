'use strict';

const mysql = require('mysql2/promise');
const debug = require('debug')('coreserve:mysql');
const log = require('../../../core/logger');
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
        log.error(`Error connecting to MySql: ${host}/${database}: ${error.message}`);
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
        log.error('Error disconnecting from MySql:', error);
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
