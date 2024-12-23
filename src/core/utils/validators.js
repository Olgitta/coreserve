'use strict';

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyObject(value) {
    return value !== null && typeof value === 'object' && Object.keys(value).length > 0;
}

function isNumberGreaterThan(value, threshold) {
    if (typeof value !== 'number') {
        return false;
    }
    return value > threshold;
}

module.exports = {isNonEmptyString, isNonEmptyObject, isNumberGreaterThan};