'use strict';

const {updateUser} = require('../core/execution-context/context');
const logger = require('../core/logger')('authMiddleware');
const jwt = require('jsonwebtoken');
const secret = 'your_secret_key';

module.exports.authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const {body, params, query, headers} = req;
        const e = new Error('Missing or invalid token.');
        logger.error(e.message, e, {body, params, query, headers});
        return res.status(401).json({ message: 'Unauthorized...' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secret);
        // Use decoded payload to update user information
        updateUser({
            userId: decoded.userId,
        });
        next();
    } catch (err) {
        const {body, params, query, headers} = req;
        const e = new Error('Missing or invalid token.');
        logger.error(e.message, e, {body, params, query, headers});
        return res.status(401).json({ message: 'Unauthorized...' });
    }
};

// // Mock function to demonstrate updating user information
// function updateUser(userData) {
//     console.log('User updated:', userData);
// }
