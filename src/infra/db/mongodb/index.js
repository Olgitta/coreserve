'use strict';

const {registerShutdownCallback} = require('../../../core/shutdown-manager');
const {connectToDatabase, closeDatabaseConnection} = require('./connection');

module.exports = async function mongoDbSetup(config) {
    await connectToDatabase(config);
    registerShutdownCallback(closeDatabaseConnection);
}