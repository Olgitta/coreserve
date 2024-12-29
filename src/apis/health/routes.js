'use strict';

const express = require('express');
const router = express.Router();

const HealthController = require('./HealthController');
const EndpointResultHandler = require('#apis/ResultHandler.js');

router.get('/health', async function (req, res) {
    const result = await HealthController.healthCheck();

    res.status(result.statusCode).send(EndpointResultHandler.handle(result));
});

module.exports = router;
