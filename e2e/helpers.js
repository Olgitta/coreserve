const Joi = require('joi');
const jwt = require('jsonwebtoken');

const BASE_URL = `http://localhost:${process.env.E2EPORT}/api`;
const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

module.exports.BASE_URL = BASE_URL;

module.exports.createTestToken = function (payload = {userId: 1}, secret = 'your_secret_key') {
    return jwt.sign(payload, secret, {expiresIn: '1h'});
}

const todoSchema = Joi.object({
    title: Joi.string().required(),
    completed: Joi.boolean().required(),
    createdAt: Joi.date().iso().required(),
    updatedAt: Joi.date().iso().required(),
    id: Joi.string().length(24).required(),
});

const postSchema = Joi.object({
    id: Joi.number().required(),
    userId: Joi.number().required(),
    title: Joi.string().required(),
    content: Joi.string().required(),
    likes: Joi.number().required(),
    createdAt: Joi.date().iso().required(),
    updatedAt: Joi.date().iso().required(),
});

const commentSchema = Joi.object({
    id: Joi.number().required(),
    postId: Joi.number().required(),
    parentId: Joi.number().required().allow(null),
    userId: Joi.number().required(),
    content: Joi.string().required(),
    likes: Joi.number().required(),
    createdAt: Joi.date().iso().required(),
    updatedAt: Joi.date().iso().required(),
});

const rsOKMetadataSchema = Joi.object({
    traceId: Joi.string().regex(guidRegex).required(),
    message: Joi.string().required(),
});

const rs400MetadataSchema = Joi.object({
    traceId: Joi.string().regex(guidRegex).required(),
    error: Joi.object({
        message: Joi.string().required(),
        code: Joi.string().required(),
        details: Joi.string().required()
    })
});

const paginationSchema = Joi.object({
    total: Joi.number().required(),
    totalPages: Joi.number().required(),
    nextPage: Joi.string().optional(),
    prevPage: Joi.string().optional(),
});

module.exports.testStatusCode = function (actual, expected) {
    expect(actual).toBe(expected);
}

module.exports.testTodoStructure = function (source) {
    const {error, value} = todoSchema.validate(source);
    expect(error).toBeUndefined();
}

module.exports.testPostStructure = function (source) {
    const {error, value} = postSchema.validate(source);
    expect(error).toBeUndefined();
}

module.exports.testCommentStructure = function (source) {
    const {error, value} = commentSchema.validate(source);
    expect(error).toBeUndefined();
}

module.exports.testCommentStructure = function (source) {
    const {error, value} = commentSchema.validate(source);
    expect(error).toBeUndefined();
}

module.exports.testOKMetadataStructure = function (source) {
    const {error, value} = rsOKMetadataSchema.validate(source);
    expect(error).toBeUndefined();
}

module.exports.test400MetadataStructure = function (source) {
    const {error} = rs400MetadataSchema.validate(source);
    expect(error).toBeUndefined();
}

module.exports.testPaginationStructure = function (source) {
    const {error, value} = paginationSchema.validate(source);
    expect(error).toBeUndefined();
}
