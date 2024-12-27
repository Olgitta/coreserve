'use strict';

module.exports.updateQueryParams = function (url, payload = {}) {
    const urlObj = new URL(url, 'http://dummy-base');

    for (const key in payload) {
        const value = payload[key];
        urlObj.searchParams.set(key, value);
    }

    return urlObj.pathname + urlObj.search;
}