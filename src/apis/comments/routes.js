'use strict';

const express = require('express');
const router = express.Router();
const CommentsController = require('./CommentsController');
const LikeOps = require('./LikeOps');
const EndpointResultHandler = require('../ResultHandler');

router.post('/', async (req, res) => {
    const result = await CommentsController.create(req.body);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.post('/like/:id', async (req, res) => {
    const result = await CommentsController.likeUnlike({...req.params, op: LikeOps.LIKE});
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.post('/unlike/:id', async (req, res) => {
    const result = await CommentsController.likeUnlike({...req.params, op: LikeOps.UNLIKE});
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.get('/', async (req, res) => {
    const result = await CommentsController.getAll(req.query);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.delete('/:id', async (req, res) => {
    const result = await CommentsController.remove(req.params);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

module.exports = router;
