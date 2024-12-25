'use strict';

const express = require('express');
const {join} = require('node:path');
const router = express.Router();

const healthRouter = require('./health');
const todosRouter = require('./todos');
const postsRouter = require('../apis/posts/routes');
const commentsRouter = require('./comments');

router.get('/', function (req, res) {
    res.sendFile(join(__dirname, '..', '..', 'public', 'index.html'));
});

module.exports = {
    indexRouter: router,
    healthRouter,
    todosRouter,
    postsRouter,
    commentsRouter,
};
