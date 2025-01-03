'use strict';

const Joi = require('joi');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const logger = require('../core/logger')('Configuration');
const debug = require('debug')('coreserve:configuration');

const mongodbSchema = Joi.object({
    url: Joi.string().uri().required(),
    database: Joi.string().min(1).required(),
});

const mysqlSchema = Joi.object({
    host: Joi.string().required(),
    user: Joi.string().required(),
    password: Joi.string(),
    database: Joi.string().min(1).required(),
});

const todosSchema = Joi.object({
    pagination: Joi.object({
        limit: Joi.number().integer().min(1).required(),
    }).required(),
});

const postsSchema = Joi.object({
    pagination: Joi.object({
        limit: Joi.number().integer().min(1).required(),
    }).required(),
});

const commentsSchema = Joi.object({
    pagination: Joi.object({
        limit: Joi.number().integer().min(1).required(),
    }).required(),
});

const configSchema = Joi.object({
    auth: Joi.object({
        secret: Joi.string().min(1).required(),
    }),
    mongodb: mongodbSchema.required(),
    mysql: mysqlSchema.required(),
    todos: todosSchema.required(),
    posts: postsSchema.required(),
    comments: commentsSchema.required(),
});

const NODE_ENV = process.env.NODE_ENV || 'development';

const dotenvFiles = [
    `.env.${NODE_ENV}`,       // Environment-specific variables
    '.env',                   // Fallback defaults
];

let initialized = false;
const config = Object.create(null);

function loadConfig() {

    dotenvFiles.forEach((file) => {
        const filePath = path.resolve(process.cwd(), file);
        debug(`Going to load .env from ${filePath}`);
        if (fs.existsSync(filePath)) {
            dotenv.config({path: filePath});
            debug(`Loaded environment variables from ${file}`);
        } else {
            debug(`Not found ${file}`);
        }
    });

    config.auth = {
        secret: process.env.AUTH_SECRET,
    }

    config.mongodb = {
        url: process.env.MONGODB_URL,
        database: process.env.MONGODB_DATABASE,
    }

    config.mysql = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    }

    config.todos = {
        pagination: {
            limit: Number(process.env.TODOS_PAGINATION_LIMIT),
        }
    }

    config.posts = {
        pagination: {
            limit: Number(process.env.POSTS_PAGINATION_LIMIT),
        }
    }

    config.comments = {
        pagination: {
            limit: Number(process.env.COMMENTS_PAGINATION_LIMIT),
        }
    }
}

module.exports = function getConfiguration() {
    if (initialized) {
        return config;
    }

    loadConfig();

    const {error, value} = configSchema.validate(config);

    if (error) {
        const e = new Error('Config validation error');
        e.details = error.details;
        logger.error('Config validation error', error);

        throw e;
    } else {
        debug('Config is valid:', value);
    }

    initialized = true;

    return config;
};