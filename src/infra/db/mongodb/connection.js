'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('coreserve:mongodb');
const logger = require('../../../core/logger')('MongoDbConnection');

/**
 *
 * @param config
 * @returns {Promise<void>}
 */
async function connectToDatabase(config) {
    const {url, database} = config;
    try {
        await mongoose.connect(url, {
            dbName: database,
            autoCreate: false
        });
        debug(`Connected to MongoDB: ${url}/${database}`);
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${url}/${database}`, error);
        throw error;
    }
}

/**
 *
 * @returns {Promise<void>}
 */
async function closeDatabaseConnection() {
    try {
        await mongoose.connection.close();
        debug('Disconnected from MongoDB.');
    } catch (error) {
        logger.error('Error disconnecting from MongoDB:', error);
    }
}

/**
 *
 * @returns {Promise<boolean>}
 */
async function pingDatabase() {
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    return true;
}

module.exports = {connectToDatabase, closeDatabaseConnection, pingDatabase};
