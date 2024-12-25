const {StatusCodes} = require("http-status-codes");
const LikeOps = require("../../../src/apis/posts/LikeOps");

const POST_ID = 1;
const USER_ID = 100;
const TITLE = 'Post title';
const CONTENT = 'Post content';
const REQUEST_URL = '/posts';
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
                content: CONTENT,
            },
            crudReceives: {
                userId: USER_ID,
                title: TITLE,
                content: CONTENT,
            },
            crudReturns: {
                id: POST_ID,
                userId: USER_ID,
                title: TITLE,
                content: CONTENT,
            },
            expected: {
                statusCode: StatusCodes.CREATED
            }
        }
    },

    CREATE_400: () => {

        return {
            request: {
                // title: TITLE,
                content: CONTENT,
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
            configMock: {posts: {pagination: {limit: configLimit}}},
            contextMock: {request: {url: REQUEST_URL}},
            crudReturns: {posts: [], total: 10},
            crudReceives: [USER_ID, skip, limit],
            expected: {
                statusCode: StatusCodes.OK,
                pagination: {
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
            configMock: {posts: {pagination: {limit: configLimit}}},
            contextMock: {request: {url: REQUEST_URL}},
            crudReturns: {posts: [], total: 10},
            crudReceives: [USER_ID, skip, configLimit],
            expected: {
                statusCode: StatusCodes.OK,
                pagination: {
                    totalPages: 2,
                    nextPage: `${REQUEST_URL}?page=2&limit=${configLimit}`,
                    prevPage: null,
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
            request: {id: POST_ID},
            crudReturns: {
                id: POST_ID,
                userId: USER_ID,
                title: TITLE,
                content: CONTENT,
            },
            crudReceives: [POST_ID, USER_ID],
            expected: {
                statusCode: StatusCodes.OK,
            }
        }
    },

    GET_BY_ID_400: () => {

        return {
            request: {id: 'invalid_input'},
            expected: {
                statusCode: StatusCodes.BAD_REQUEST,
            }
        }
    },

    DELETE_200: () => {

        return {
            request: {id: POST_ID},
            crudReturns: {deleted: 1, post: {/*deleted post*/}},
            crudReceives: [POST_ID, USER_ID],
            expected: {statusCode: StatusCodes.OK},
        }
    },

    DELETE_400: () => {
        return {
            request: {id: 'invalid_input'},
            expected: {statusCode: StatusCodes.BAD_REQUEST},
        }
    },

    UPDATE_200: () => {

        return {
            request: {
                id: POST_ID,
                title: TITLE,
                content: CONTENT,
            },
            crudReceives: [
                POST_ID,
                USER_ID,
                {
                    title: TITLE,
                    content: CONTENT,
                }
            ],
            crudReturns: {
                updated: 1,
                post: {
                    id: POST_ID,
                    userId: USER_ID,
                    title: TITLE,
                    content: CONTENT,
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
                id: POST_ID,
                title: TITLE,
                // content: CONTENT,
            },
            expected: {
                statusCode: StatusCodes.BAD_REQUEST
            }
        }

    },

    LIKE_200: () => {

        return {
            request: {
                id: POST_ID,
                op: LikeOps.LIKE
            },
            crudReceives: [
                POST_ID, USER_ID, LikeOps.LIKE
            ],
            crudReturns: 1,
            expected: {statusCode: StatusCodes.OK},
        }
    },

    UNLIKE_200: () => {

        return {
            request: {
                id: POST_ID,
                op: LikeOps.UNLIKE
            },
            crudReceives: [
                POST_ID, USER_ID, LikeOps.UNLIKE
            ],
            crudReturns: 1,
            expected: {statusCode: StatusCodes.OK},
        }
    },

    LIKE_UNLIKE_400: () => {

        return {
            request: {
                id: 'invalid_input',
                op: LikeOps.LIKE
            },
            expected: {statusCode: StatusCodes.BAD_REQUEST},
        }
    }
}