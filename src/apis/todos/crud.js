'use strict';

const debug = require('debug')('coreserve:todos:crud');
const TodoModel = require('./TodoModel');

module.exports = {createTodo, updateTodo, deleteTodo, getTodoById, getTodos};

/**
 *
 * @param payload
 * @returns {Promise<Query<Document>>}
 */
async function createTodo(payload) {
    debug('createTodo called with:', {payload});
    const todo = new TodoModel(payload);
    await todo.save();

    return todo;
}

/**
 *
 * @param options
 * @param filter
 * @returns {Promise<{todos: [Query<Document>]}, {total: Number}>}
 */
async function getTodos(options, filter) {
    debug('getTodos called with:', {options, filter});

    const {skip, limit} = options;
    const result = await TodoModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({updatedAt: -1});

    const total = await TodoModel.countDocuments();

    return {todos: result, total};
}

/**
 *
 * @param filter
 * @returns {Promise<Query<Document>>}
 */
async function getTodoById(filter) {
    debug('getTodoById called with:', {filter});

    const {id, userId} = filter;

    return TodoModel.findOne({
        _id: id,
        userId: userId
    });
}

/**
 *
 * @param payload
 * @param filter
 * @returns {Promise<Query<Document>>}
 */
async function updateTodo(payload, filter) {
    debug('updateTodo called with:', {payload, filter});

    const {id, userId} = filter;

    return TodoModel.findOneAndUpdate({
        _id: id,
        userId: userId
    }, payload);
}

/**
 *
 * @param filter
 * @returns {Promise<Query<Document>>}
 */
async function deleteTodo(filter) {
    debug('deleteTodo called with:', {filter});

    const {id, userId} = filter;
    return TodoModel.findOneAndDelete({
        _id: id,
        userId: userId
    });
    // return TodoModel.findOneAndDelete({
    //     _id: id,
    //     userId: userId
    // }, { includeResultMetadata: true });
}
