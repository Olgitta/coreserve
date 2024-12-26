'use strict';

const express = require('express');
const router = express.Router();

const getHealthCheckController = require('../apis/health/controller');
const ResponseBuilder = require('../apis/ResponseBuilder');
const {getTraceId} = require('../core/execution-context/context');

router.get('/health', async function (req, res) {
    const controller = getHealthCheckController();

    const builder = new ResponseBuilder();
    builder.setTraceId(getTraceId());

    const {error} = await controller.healthCheck();

    if (error) {
        builder.setMessage(`ERROR: ${error.message}`);
        res.status(500).json(builder.build());
        return;
    }

    builder.setMessage('OK');
    res.json(builder.build());

});

module.exports = router;
