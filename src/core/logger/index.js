'use strict';

const {getCtx, getTraceId, getRequestUrl, getRequestMethod} = require('../execution-context/context');
const {createLogger, format, transports} = require('winston');
const {getUrlPath} = require('#core/utils/urlUtils.js');

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

module.exports = function (p = 'ApiLog') {

    const prefix = p;

    // todo: log url and method in info and warn
    return {
        info(msg, payload = {}) {

            logger.info(`${prefix}:${msg}`, buildMeta(payload));
        },
        warn(msg, payload = {}) {

            logger.warn(`${prefix}:${msg}`, buildMeta(payload));
        },
        error(msg, error = {}, payload = {}) {
            const rqPath = getUrlPath(getRequestUrl()) || null;
            const rqMethod = getRequestMethod() || null;
            let prfx = prefix;

            if(rqPath) {
                prfx += `:${rqMethod} ${rqPath}:`;
            }

            logger.error(`${prfx}:${msg}`, buildMeta({
                ...payload,
                error: error
            }));
        }
    };
};