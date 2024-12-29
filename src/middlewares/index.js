'use strict';

const {authMiddleware} = require('./authMiddleware');
const {contextMiddleware} = require('./contextMiddleware');

module.exports = {
    authMiddleware,
    contextMiddleware
}