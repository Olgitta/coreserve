'use strict';

const { v4: uuidv4 } = require('uuid');

function getGuid() {
    return uuidv4();
}

function uuidToBinary(uuid) {
    return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}

function binaryToUuid(binary) {
    return binary.toString('hex').replace(
        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
        '$1-$2-$3-$4-$5'
    );
}

module.exports = {
    getGuid,
    uuidToBinary,
    binaryToUuid
}

// let guid = getGuid();
// let uuidToBinaryV = uuidToBinary(guid);
// let binaryToUuidV = binaryToUuid(uuidToBinaryV);
//
// console.log(guid);
// console.log(binaryToUuidV);
// console.log(uuidToBinaryV);
