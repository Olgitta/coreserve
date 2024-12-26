'use strict';

const express = require('express');
const router = express.Router();
const PostsController = require('./PostsController');
const ResponseBuilder = require('../ResponseBuilder');
const {getTraceId} = require('#core/execution-context/context.js');
const LikeOps = require('./LikeOps');

/**
 *
 * @param result
 * @param result.statusCode
 * @param result.resources
 * @param result.message
 * @param result.error
 * @param result.pagination
 * @returns {*}
 */
function handleResult(result) {
    const {
        statusCode,
        resources,
        message,
        error,
        pagination
    } = result;

    const builder = new ResponseBuilder();

    builder
        .setResources(resources)
        .setMessage(message)
        .setPagination(pagination)
        .setError(error)
        .setTraceId(getTraceId());

    return builder.build();
}

router.post('/', async (req, res) => {
    const result = await PostsController.create(req.body);
    res.status(result.statusCode).send(handleResult(result));
});

router.post('/like/:id', async (req, res) => {
    const result = await PostsController.likeUnlike({...req.params, op: LikeOps.LIKE});
    res.status(result.statusCode).send(handleResult(result));
});

router.post('/unlike/:id', async (req, res) => {
    const result = await PostsController.likeUnlike({...req.params, op: LikeOps.UNLIKE});
    res.status(result.statusCode).send(handleResult(result));
});

router.get('/', async (req, res) => {
    const result = await PostsController.getAll(req.query);
    res.status(result.statusCode).send(handleResult(result));
});

router.get('/:id', async (req, res) => {
    const result = await PostsController.getById(req.params);
    res.status(result.statusCode).send(handleResult(result));
});

router.put('/:id', async (req, res) => {
    const result = await PostsController.update({...req.body, ...req.params});
    res.status(result.statusCode).send(handleResult(result));
});

router.delete('/:id', async (req, res) => {
    const result = await PostsController.remove(req.params);
    res.status(result.statusCode).send(handleResult(result));
});

module.exports = router;
