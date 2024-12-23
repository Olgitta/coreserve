'use strict';

const {getCtx, getTraceId} = require('../execution-context/context');
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
        // new transports.File({filename: 'combined.log'}),
        // new transports.File({filename: 'errors.log', level: 'error'}),
    ]
});

const buildMeta = function (additional) {
    const context = getCtx() || {};
    return {
        traceId: getTraceId() || 'notraceid',
        payload: {
            context,
            ...additional,
        }
    }
};

module.exports = function (p='ApiLog') {

    let prefix = p;

    const log = {
        info(msg, payload = {}) {

            logger.info(`${prefix}:${msg}`, buildMeta(payload));
        },
        warn(msg, payload = {}) {

            logger.warn(`${prefix}:${msg}`, buildMeta(payload));
        },
        error(msg, error, payload={}) {
            const context = getCtx() || {};
            const {message, stack, code = ''} = error || {};
            logger.error(`${prefix}:${msg}`, buildMeta({
                ...payload,
                error: {
                    message, code, stack
                }
            }));
        }
    };

    return log;
};