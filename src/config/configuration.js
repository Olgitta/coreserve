'use strict';

const Joi = require('joi');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const log = require('../core/logger');
const debug = require('debug')('coreserve:configuration');

// Define the schema for MongoDB configuration
const mongodbSchema = Joi.object({
    url: Joi.string().uri().required(),
    database: Joi.string().min(1).required(),
});

// Define the schema for Todos configuration
const todosSchema = Joi.object({
    pagination: Joi.object({
        limit: Joi.number().integer().min(1).required(),
    }).required(),
});

// Define the overall config schema
const configSchema = Joi.object({
    mongodb: mongodbSchema.required(),
    todos: todosSchema.required(),
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

    config.mongodb = {
        url: process.env.MONGODB_URL,
        database: process.env.MONGODB_DATABASE,
    }

    config.todos = {
        pagination: {
            limit: Number.parseInt(process.env.TODOS_PAGINATION_LIMIT, 10),
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
        log.error('Config validation error', error);

        throw e;
    } else {
        debug('Config is valid:', value);
    }

    initialized = true;

    return config;
};