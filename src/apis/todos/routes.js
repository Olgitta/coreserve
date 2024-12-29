'use strict';

const express = require('express');
const TodosController = require('./TodosController');
const EndpointResultHandler = require('../ResultHandler');
const router = express.Router();

router.post('/', async (req, res) => {
    const result = await TodosController.create(req.body);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.get('/', async (req, res) => {
    const result = await TodosController.getAll(req.query);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.get('/:id', async (req, res) => {
    const result = await TodosController.getById(req.params);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.put('/:id', async (req, res) => {
    const result = await TodosController.update({...req.params, ...req.body });
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

router.delete('/:id', async (req, res) => {
    const result = await TodosController.remove(req.params);
    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

module.exports = router;
