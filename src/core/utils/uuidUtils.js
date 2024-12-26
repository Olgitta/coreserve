'use strict';

const {v4: uuidv4} = require('uuid');

module.exports.getGuid = function () {
    return uuidv4();
}

module.exports.uuidToBinary = function (uuid) {
    return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}

module.exports.binaryToUuid = function (binary) {
    return binary.toString('hex').replace(
        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
        '$1-$2-$3-$4-$5'
    );
}
