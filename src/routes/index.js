'use strict';

const express = require('express');
const {join} = require('node:path');
const router = express.Router();

const healthRouter = require('./health');
const todosRouter = require('#apis/todos/routes.js');
const postsRouter = require('#apis/posts/routes.js');
const commentsRouter = require('#apis/comments/routes.js');

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
