'use strict';

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./openapi/api-spec.json');

const contextMiddleware = require('./core/execution-context/contextMiddleware');

const indexRouter = require('./routes');
const healthRouter = require('./routes/health');
const todosRouter = require('./routes/todos');
const postsRouter = require('./routes/posts');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(contextMiddleware);

//todo: Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error(`Error: ${err.message}`);
    console.error(`Stack: ${err.stack}`);

    // Set the default error status code and message
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Internal Server Error';

    // Respond with a consistent error structure
    res.status(statusCode).json({
        success: false,
        error: {
            message: errorMessage,
            // Only include the stack trace in development
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
});

app.use('/api-spec', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', indexRouter);
app.use('/', healthRouter);
app.use('/todos', todosRouter);
app.use('/posts', postsRouter);

module.exports = app;
