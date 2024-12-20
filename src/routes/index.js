'use strict';

const express = require('express');
const {join} = require('node:path');
const router = express.Router();

router.get('/', function (req, res) {
    res.sendFile(join(__dirname, '..', '..', 'public', 'index.html'));
});

module.exports = router;
