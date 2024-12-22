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


const BASE_URL = 'http://localhost:5000';
const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const loremIpsumSet = [
    {
        title: 'Lorem ipsum dolor sit amet.',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis laoreet mauris. Mauris eu sapien maximus, varius diam a, molestie ipsum. Quisque eget fermentum nisi. Donec molestie risus id ipsum hendrerit dignissim. Nulla nec lectus commodo libero pellentesque efficitur quis facilisis nisi. Pellentesque sed metus rutrum, condimentum ligula elementum, fermentum turpis. Pellentesque in imperdiet purus.',
    },
    {
        title: 'Nunc ut vestibulum libero.',
        text: 'Nunc ut vestibulum libero. Nulla facilisi. Integer quis maximus erat, at malesuada augue. Fusce ultricies mauris eu orci viverra, et dictum orci ultrices. Sed cursus rhoncus elementum. Integer metus arcu, consectetur in viverra ut, ultrices id ipsum. Phasellus venenatis, lectus sit amet imperdiet aliquam, augue dui imperdiet odio, sit amet aliquam lacus purus in nulla.',
    },
];

const loremIpsum = {
    getLoremIpsum(i = 0) {
        if (i >= loremIpsumSet.length) {
            return loremIpsumSet[0];
        }

        return loremIpsumSet[i];
    },
};

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
    loremIpsum,
    postSchema,
    testPostStructure
}