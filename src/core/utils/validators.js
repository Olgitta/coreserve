'use strict';

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyObject(value) {
    return value !== null && typeof value === 'object' && Object.keys(value).length > 0;
}

module.exports = {isNonEmptyString, isNonEmptyObject};