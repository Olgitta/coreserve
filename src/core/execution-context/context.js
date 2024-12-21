'use strict';

const { AsyncLocalStorage } = require('node:async_hooks');
const {getGuid} = require('../utils/guidUtil');
const debug = require('debug')('coreserve:context');

const asyncLocalStorage = new AsyncLocalStorage();

module.exports.createCtx = (payload, cb) => {
    const traceId = getGuid();
    const context = { ...payload, traceId };

    debug(`createCtx: ${traceId}`);
    asyncLocalStorage.run(context, cb);
};

module.exports.getCtx = () => {
    return getContext();
};

module.exports.getTraceId = () => {
    return getContext().traceId;
};

function getContext() {
    const context = asyncLocalStorage.getStore();
    if (!context) {
        debug('No context available for the current execution.');
        return {};
    }
    return context;
}
