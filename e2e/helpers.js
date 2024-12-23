const Joi = require('joi');

const todoSchema = Joi.object({
    title: Joi.string().required(),
    completed: Joi.boolean().required(),
    createdAt: Joi.date().iso().required(),
    updatedAt: Joi.date().iso().required(),
    id: Joi.string().length(24).required(),
});

const postSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    createdAt: Joi.date().iso().required(),
    updatedAt: Joi.date().iso().required(),
    id: Joi.number().required(),
    likes: Joi.number().required(),
});


const BASE_URL = `http://localhost:${process.env.E2EPORT}/api`;
const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function testStatusAndTraceId(status, traceId, expectedStatus) {
    expect(status).toBe(expectedStatus);
    expect(traceId).toMatch(guidRegex);
}

function testTodoStructure(todo) {
    const {error, value} = todoSchema.validate(todo);
    expect(error).toBeUndefined();
}

function testPostStructure(post) {
    const {error, value} = postSchema.validate(post);
    expect(error).toBeUndefined();
}

module.exports = {
    BASE_URL,
    guidRegex,
    testStatusAndTraceId,
    testTodoStructure,
    postSchema,
    testPostStructure
}