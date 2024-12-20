'use strict';

const {createCtx} = require('./context');

const contextMiddleware = (req, res, next) => {
    const {url, method, params, query, body} = req;
    createCtx({request: {url, method, params, query, body}}, next);
};

module.exports = contextMiddleware;