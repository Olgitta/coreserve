'use strict';

const debug = require('debug')('coreserve:todos:crud');
const Todo = require('./Todo');

async function createTodo(title) {
    const todo = new Todo({title});
    await todo.save();
    debug('createTodo', todo);
    return todo;
}

async function getTodos() {
    const todos = await Todo.find()
        .sort({updatedAt: -1});
    debug('getTodos', todos);
    return todos;
}

async function getTodosWithPagination(skip, limit) {
    const todos = await Todo.find()
        .skip(skip)
        .limit(limit)
        .sort({updatedAt: -1});

    debug('getTodosWithPagination', todos);

    const total = await Todo.countDocuments();

    return {todos, total};
}

async function getTodoById(id) {
    const todo = await Todo.findById(id);
    if (!todo) {
        debug(`Todo with ID ${id} not found.`);
        return null;
    }
    debug('getTodoById', todo);
    return todo;
}

async function updateTodo(id, updates) {
    const updatedTodo = await Todo.findByIdAndUpdate(id, updates, {new: true});
    //{ new: true }: Ensures that the method returns the updated version of the document after applying the changes.
    if (!updatedTodo) {
        debug(`updateTodo:ID ${id} not found.`);
        return null;
    }
    debug('updateTodo', updatedTodo);
    return updatedTodo;
}

async function deleteTodo(id) {
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
        debug(`deleteTodo:ID ${id} not found.`);
        return null;
    }
    debug('deleteTodo', deletedTodo);
    return deletedTodo;
}

module.exports = {createTodo, getTodos, updateTodo, deleteTodo, getTodoById, getTodosWithPagination};
