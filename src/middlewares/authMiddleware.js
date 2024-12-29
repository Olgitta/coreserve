'use strict';

const {updateUser} = require('#core/execution-context/context.js');
const logger = require('#core/logger/index.js')('AuthMiddleware');
const getConfiguration = require('#config/configuration.js');
const jwt = require('jsonwebtoken');
const secret = getConfiguration().auth.secret;

module.exports.authMiddleware = (req, res, next) => {
    if(process.env.NODE_ENV !== 'production') {
        updateUser({
            userId: 1,
        });
        next();
        return;
    }
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
