'use strict';

const { AsyncLocalStorage } = require('node:async_hooks');
const {getGuid} = require('../utils/uuidUtils');
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

module.exports.updateUser = (updates) => {
    debug('updateUser with:', updates);
    const context = getContext();
    Object.assign(context, {user: updates});
}

module.exports.getUser = () => {
    return getContext().user;
}

function getContext() {
    const context = asyncLocalStorage.getStore();
    if (!context) {
        debug('No context available for the current execution.');
        return {};
    }
    return context;
}
