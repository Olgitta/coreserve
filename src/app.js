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

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(contextMiddleware);

app.use('/api-spec', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', indexRouter);
app.use('/', healthRouter);
app.use('/todos', todosRouter);

module.exports = app;
