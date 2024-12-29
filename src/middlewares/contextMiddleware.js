'use strict';

const {createCtx} = require('#core/execution-context/context.js');

module.exports.contextMiddleware = (req, res, next) => {
    const {url, method, params, query, body} = req;
    createCtx({request: {url, method, params, query, body}}, next);
};
