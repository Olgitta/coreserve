'use strict';

const express = require('express');
const router = express.Router();
const PostsController = require('./PostsController');
const LikeOps = require('./LikeOps');
const EndpointResultHandler = require('../ResultHandler');

router.post('/', async (req, res) => {
    const result = await PostsController.create(req.body);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.post('/like/:id', async (req, res) => {
    const result = await PostsController.likeUnlike({...req.params, op: LikeOps.LIKE});
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.post('/unlike/:id', async (req, res) => {
    const result = await PostsController.likeUnlike({...req.params, op: LikeOps.UNLIKE});
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.get('/', async (req, res) => {
    const result = await PostsController.getAll(req.query);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.get('/:id', async (req, res) => {
    const result = await PostsController.getById(req.params);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.put('/:id', async (req, res) => {
    const result = await PostsController.update({...req.body, ...req.params});
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.delete('/:id', async (req, res) => {
    const result = await PostsController.remove(req.params);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

module.exports = router;
