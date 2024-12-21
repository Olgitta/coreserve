const Joi = require('joi');

const todoSchema = Joi.object({
    title: Joi.string().required(), // title is a string and required
    completed: Joi.boolean().required(), // completed is a boolean and required
    createdAt: Joi.date().iso().required(), // createdAt is an ISO date string and required
    updatedAt: Joi.date().iso().required(), // updatedAt is an ISO date string and required
    id: Joi.string().length(24).required(), // id is a 24-character string (e.g., Mongo ObjectID)
});

const BASE_URL = 'http://localhost:5000';
const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function testStatusAndTraceId(status, traceId, expectedStatus) {
    expect(status).toBe(expectedStatus);
    expect(traceId).toMatch(guidRegex);
}

function testTodoStructure(todo) {
    const { error, value } = todoSchema.validate(todo);
    expect(error).toBeUndefined();
}

module.exports = {
    BASE_URL,
    guidRegex,
    testStatusAndTraceId,
    testTodoStructure
}