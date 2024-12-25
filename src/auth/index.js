'use strict';

const {updateUser} = require('../core/execution-context/context');

module.exports.authMiddleware = (req, res, next) => {
    // Dummy middleware - should be implemented with JWT
    updateUser({
        userId: 1
    })

    next();
};