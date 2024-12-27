'use strict';

const debug = require('debug')('coreserve:todos:crud');
const TodoModel = require('./TodoModel');

module.exports = {createTodo, updateTodo, deleteTodo, getTodoById, getTodos};

/**
 *
 * @param payload
 * @returns {Promise<TodoModel>}
 */
async function createTodo(payload) {
    debug('createTodo called with:', {payload});
    const todo = new TodoModel(payload);
    await todo.save();

    return todo;
}

/**
 *
 * @param payload
 * @returns {Promise<{todos,total}>}
 */
async function getTodos(payload) {
    debug('getTodos called with:', {payload});

    const {userId, skip, limit} = payload;
    const todos = await TodoModel.find({userId})
        .skip(skip)
        .limit(limit)
        .sort({updatedAt: -1});

    const total = await TodoModel.countDocuments();

    return {todos, total};
}

/**
 *
 * @param filter
 * @returns {Promise<Query<Document>>}
 */
async function getTodoById(filter) {
    debug('getTodoById called with:', {filter});

    return TodoModel.findOne(filter);
}

/**
 *
 * @param payload
 * @param filter
 * @returns {Promise<Query<Document>>}
 */
async function updateTodo(payload, filter) {
    debug('updateTodo called with:', {payload, filter});

    return TodoModel.findOneAndUpdate(filter, payload);
}

/**
 *
 * @param filter
 * @returns {Promise<Query<Document>>}
 */
async function deleteTodo(filter) {
    debug('deleteTodo called with:', {filter});

    return TodoModel.findOneAndDelete(filter);
}
