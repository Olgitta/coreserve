'use strict';

const express = require('express');
const TodosController = require('./TodosController');
const ResponseBuilder = require('../ResponseBuilder');
const context = require('#core/execution-context/context.js');
const router = express.Router();

// todo: make one handleResult for all apis
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
        .setTraceId(context.getTraceId());

    return builder.build();
}

router.post('/', async (req, res) => {
    const result = await TodosController.create(req.body);
    res.status(result.statusCode).send(handleResult(result));
});

router.get('/', async (req, res) => {
    const result = await TodosController.getAll(req.query);
    res.status(result.statusCode).send(handleResult(result));
});

router.get('/:id', async (req, res) => {
    const result = await TodosController.getById(req.params);
    res.status(result.statusCode).send(handleResult(result));
});

router.put('/:id', async (req, res) => {
    const result = await TodosController.update({...req.params, ...req.body });
    res.status(result.statusCode).send(handleResult(result));
});

router.delete('/:id', async (req, res) => {
    const result = await TodosController.remove(req.params);
    res.status(result.statusCode).send(handleResult(result));
});

module.exports = router;
