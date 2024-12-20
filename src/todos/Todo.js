'use strict';

const mongoose = require('mongoose');
const idTransformPlugin = require('../infra/db/mongodb/idTransformPlugin');

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, {
    timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

todoSchema.plugin(idTransformPlugin);

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
