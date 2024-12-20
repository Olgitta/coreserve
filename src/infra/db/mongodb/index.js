'use strict';

const {registerShutdownCallback} = require('../../../core/shutdownManager');
const {connectToDatabase, closeDatabaseConnection} = require('./connection');

module.exports = async function mongoDbSetup(config) {
    await connectToDatabase(config);
    registerShutdownCallback(closeDatabaseConnection);
}