'use strict';

const {getCtx} = require('./execution-context/context');
const {createLogger, format, transports} = require('winston');

const devFormat = format.combine(
    format.timestamp(),
    format.json(),
    format.prettyPrint({
        colorize: true,
        depth: 7,
    })
);

const prodFormat = format.combine(
    format.timestamp(),
    format.json()
);

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [
        new transports.Console(),
        new transports.File({filename: 'combined.log'}),
        new transports.File({filename: 'errors.log', level: 'error'}),

    ]
});

const log = {
    info(msg, args = {}) {
        const context = getCtx() || {};
        logger.info(msg, {...args, ...context});
    },
    warn(msg, args = {}) {
        const context = getCtx() || {};
        logger.warn(msg, {...args, ...context});
    },
    error(msg, error) {
        const context = getCtx() || {};
        const {message, stack} = error || {};
        logger.error(msg, {message, stack, ...context});
    }
};

module.exports = log;