'use strict';

module.exports.updateQueryParams = function (url, payload = {}) {
    const urlObj = new URL(url, 'http://dummy-base');

    for (const key in payload) {
        const value = payload[key];
        urlObj.searchParams.set(key, value);
    }

    return urlObj.pathname + urlObj.search;
}

module.exports.getUrlPath = function (url) {
    if (!url) {
        return null;
    }

    const urlObj = new URL(url, 'http://dummy-base');

    return urlObj.pathname;
}