'use strict';

const debug = require('debug')('coreserve:server');
const http = require('node:http');
const {getShutdownCallbacks} = require('./core/shutdown-manager');
const getConfiguration = require('./config/configuration');
const mongoDbSetup = require('./infra/db/mongodb');
const mySqlSetup = require('./infra/db/mysql');

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1); // Exit to avoid undefined behavior
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1); // Exit to avoid undefined behavior
});

const port = normalizePort(process.env.PORT || '3000');

module.exports = async function start() {

    const config = getConfiguration();

    await mongoDbSetup(config.mongodb);
    await mySqlSetup(config.mysql);

    const app = require('../src/app');
    app.set('port', port);

    const server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', () => {
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    });

    process.on('SIGINT', async () => {
        debug('Received SIGINT. Gracefully shutting down...');
        await shutdown();
        server.close(() => {
            debug('HTTP server closed.');
            process.exit(0);
        });
    });

    process.on('SIGTERM', async () => {
        debug('Received SIGTERM. Gracefully shutting down...');
        await shutdown();
        server.close(() => {
            debug('HTTP server closed.');
            process.exit(0);
        });
    });

}

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

async function shutdown() {
    try {
        const shutdownCallbacks = getShutdownCallbacks();
        debug(`ShutdownCallbacks started, size: ${shutdownCallbacks.length}`);
        for (const cb of shutdownCallbacks) {
            await cb();
        }
    } catch (error) {
        console.error('Error during shutdown callback call:', error);
    }
}
