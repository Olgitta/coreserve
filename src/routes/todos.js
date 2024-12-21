'use strict';

const express = require('express');
const {create, update, remove, getById, getAll} = require('../todos/controller');
const ResponseBuilder = require('../builders/ResponseBuilder');
const {getTraceId} = require('../core/execution-context/context');
const {isNonEmptyObject} = require('../core/utils/validators');
const router = express.Router();

function handleResult(result) {
    const builder = new ResponseBuilder();

    builder
        .setResources(result.resources)
        .setError(result.error)
        .setTraceId(getTraceId());

    if(isNonEmptyObject(result.pagination)) {
        const {totalPages, nextPage, prevPage} = result.pagination;
        builder.setPagination(totalPages, nextPage, prevPage);
    }

    return builder.build();
}

router.post('/', async (req, res) => {
    const {title} = req.body;
    const result = await create(title);
    res.status(result.statusCode).send(handleResult(result));
});

router.get('/', async (req, res) => {
    const result = await getAll(req.query);
    res.status(result.statusCode).send(handleResult(result));
});

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    const result = await getById(id);
    res.status(result.statusCode).send(handleResult(result));
});

router.put('/:id', async (req, res) => {
    const {id} = req.params;
    const updates = req.body;
    const result = await update(id, updates);
    res.status(result.statusCode).send(handleResult(result));
});

router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    const result = await remove(id);
    res.status(result.statusCode).send(handleResult(result));
});

module.exports = router;
