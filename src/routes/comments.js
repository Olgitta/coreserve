'use strict';
const express = require('express');
const router = express.Router();
const {
    create,
    getAll,
    getById,
    like,
    remove,
    unlike,
} = require('../apis/comments/controller');
const ResponseBuilder = require('../apis/ResponseBuilder');
const {getTraceId} = require('../core/execution-context/context');
const Validator = require('../core/utils/Validator');

function handleResult(result) {

    const builder = new ResponseBuilder();

    builder
        .setResources(result.resources)
        .setError(result.error)
        .setTraceId(getTraceId());

    const {errors} = new Validator()
        .isNonEmptyObject(result.pagination)
        .validate();

    if (!errors) {
        const {totalPages, nextPage, prevPage} = result.pagination;
        builder.setPagination(totalPages, nextPage, prevPage);
    }

    return builder.build();
}

router.post('/', async (req, res) => {
    const result = await create(req.body);
    res.status(result.statusCode).send(handleResult(result));
});

router.post('/like/:id', async (req, res) => {
    const {id} = req.params;
    const result = await like(id);
    res.status(result.statusCode).send(handleResult(result));
});

router.post('/unlike/:id', async (req, res) => {
    const {id} = req.params;
    const result = await unlike(id);
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

router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    const result = await remove(id);
    res.status(result.statusCode).send(handleResult(result));
});

module.exports = router;
