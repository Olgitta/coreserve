'use strict';

const {StatusCodes} = require('http-status-codes');
const LikeOps = require('../../../src/apis/posts/LikeOps');

const RESOURCE_ID = '676ef0585880376a69f8dc6e';
const USER_ID = 100;
const TITLE = 'Todo title';
const REQUEST_URL = '/todos';
const CTX_PAYLOAD = {
    request: {
        url: REQUEST_URL
    }
};

module.exports = {

    USER_ID,

    CTX_PAYLOAD,

    CREATE_201: () => {

        return {
            request: {
                title: TITLE,
            },
            crudReceives: {
                userId: USER_ID,
                title: TITLE,
            },
            crudReturns: {
                id: RESOURCE_ID,
                userId: USER_ID,
                title: TITLE,
                completed: false,
            },
            expected: {
                statusCode: StatusCodes.CREATED
            }
        }
    },

    CREATE_400: () => {

        return {
            request: {
            },
            expected: {
                statusCode: StatusCodes.BAD_REQUEST
            }
        }

    },

    GET_ALL_200: () => {

        const limit = 3;
        const configLimit = 3;
        const skip = (2 - 1) * 3;

        return {
            request: {
                page: 2,
                limit: limit,
            },
            configMock: {todos: {pagination: {limit: configLimit}}},
            contextMock: {request: {url: REQUEST_URL}},
            crudReturns: {todos: [], total: 10},
            crudReceives: [{skip, limit}, {userId: USER_ID}],
            expected: {
                statusCode: StatusCodes.OK,
                pagination: {
                    total: 10,
                    totalPages: 4,
                    nextPage: `${REQUEST_URL}?page=3&limit=${limit}`,
                    prevPage: `${REQUEST_URL}?page=1&limit=${limit}`,
                }
            },
        }
    },

    GET_ALL_200_NO_PAGINATION_PARAMS: () => {

        const configLimit = 5;
        const skip = 0;

        return {
            request: {},
            configMock: {todos: {pagination: {limit: configLimit}}},
            contextMock: {request: {url: REQUEST_URL}},
            crudReturns: {todos: [], total: 10},
            crudReceives: [{skip, limit: configLimit}, {userId: USER_ID}],
            expected: {
                statusCode: StatusCodes.OK,
                pagination: {
                    total: 10,
                    totalPages: 2,
                    nextPage: `${REQUEST_URL}?page=2&limit=${configLimit}`,
                }
            },
        }
    },

    GET_ALL_200_NO_RECORDS_FOUND: () => {

        const configLimit = 5;
        const skip = 0;

        return {
            request: {},
            configMock: {todos: {pagination: {limit: configLimit}}},
            contextMock: {request: {url: REQUEST_URL}},
            crudReturns: {todos: [], total: 0},
            crudReceives: [{skip, limit: configLimit}, {userId: USER_ID}],
            expected: {
                statusCode: StatusCodes.OK,
                pagination: {
                    total: 0,
                    totalPages: 0,
                }
            },
        }
    },

    GET_ALL_400: () => {

        const limit = 3;

        return {
            request: {
                page: '2_invalid_input',
                limit: limit,
            },
            configMock: {posts: {pagination: {limit: limit}}},
            contextMock: {request: {url: REQUEST_URL}},
            expected: {
                statusCode: StatusCodes.BAD_REQUEST
            },
        }
    },

    GET_BY_ID_200: () => {

        return {
            request: {id: RESOURCE_ID},
            crudReturns: {
                id: RESOURCE_ID,
                userId: USER_ID,
                title: TITLE,
                completed: false,
            },
            crudReceives: {id: RESOURCE_ID, userId: USER_ID},
            expected: {
                statusCode: StatusCodes.OK,
            }
        }
    },

    GET_BY_ID_400: () => {

        return {
            request: {id: 99999999},
            expected: {
                statusCode: StatusCodes.BAD_REQUEST,
            }
        }
    },

    DELETE_200: () => {

        return {
            request: {id: RESOURCE_ID},
            crudReturns: {deleted: 1, post: {/*deleted post*/}},
            crudReceives: {id: RESOURCE_ID, userId: USER_ID},
            expected: {statusCode: StatusCodes.OK},
        }
    },

    DELETE_400: () => {
        return {
            request: {id: ''},
            expected: {statusCode: StatusCodes.BAD_REQUEST},
        }
    },

    UPDATE_200: () => {

        return {
            request: {
                id: RESOURCE_ID,
                completed: true,
            },
            crudReceives: [
                {
                    completed: true,
                },
                {
                    id: RESOURCE_ID,
                    userId: USER_ID,
                }
            ],
            crudReturns: {
                updated: 1,
                post: {
                    id: RESOURCE_ID,
                    userId: USER_ID,
                    title: TITLE,
                    completed: true,
                }
            },
            expected: {
                statusCode: StatusCodes.OK
            }
        }
    },

    UPDATE_400: () => {

        return {
            request: {
                id: RESOURCE_ID,
                completed: 100,
            },
            expected: {
                statusCode: StatusCodes.BAD_REQUEST
            }
        }

    },

}