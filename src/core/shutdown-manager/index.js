'use strict';

const callbacks = [];

/**
 *
 * @param cb
 */
module.exports.registerShutdownCallback = (cb) => {
    callbacks.push(cb);
};

/**
 *
 * @returns {*[]}
 */
module.exports.getShutdownCallbacks = () => {
    return callbacks;
}