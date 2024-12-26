const {StatusCodes} = require('http-status-codes');
const LikeOps = require('../../../src/apis/comments/LikeOps');

const COMMENT_ID = 12;
const PARENT_COMMENT_ID = 1;
const POST_ID = 16;
const USER_ID = 100;
const CONTENT = 'Comment content';
const REQUEST_URL = '/comments';
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
                postId: POST_ID,
                content: CONTENT,
            },
            crudReceives: {
                userId: USER_ID,
                postId: POST_ID,
                parentId: null,
                content: CONTENT,
            },
            crudReturns: {
                id: COMMENT_ID,
                postId: POST_ID,
                parentId: null,
                userId: USER_ID,
                content: CONTENT,
            },
            expected: {
                statusCode: StatusCodes.CREATED
            }
        }
    },

    CREATE_REPLY_201: () => {

        return {
            request: {
                postId: POST_ID,
                parentId: PARENT_COMMENT_ID,
                content: CONTENT,
            },
            crudReceives: {
                userId: USER_ID,
                postId: POST_ID,
                parentId: PARENT_COMMENT_ID,
                content: CONTENT,
            },
            crudReturns: {
                id: COMMENT_ID,
                postId: POST_ID,
                parentId: PARENT_COMMENT_ID,
                userId: USER_ID,
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
                // postId: POST_ID,
                parentId: PARENT_COMMENT_ID,
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
                postId: POST_ID,
                parentId: PARENT_COMMENT_ID,
                page: 2,
                limit: limit,
            },
            configMock: {comments: {pagination: {limit: configLimit}}},
            contextMock: {request: {url: REQUEST_URL}},
            crudReturns: {comments: [], total: 10},
            crudReceives: [POST_ID, PARENT_COMMENT_ID, USER_ID, skip, limit],
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
            request: {
                postId: POST_ID,
                parentId: PARENT_COMMENT_ID,
            },
            configMock: {comments: {pagination: {limit: configLimit}}},
            contextMock: {request: {url: REQUEST_URL}},
            crudReturns: {comments: [], total: 10},
            crudReceives: [POST_ID, PARENT_COMMENT_ID, USER_ID, skip, configLimit],
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
            request: {
                postId: POST_ID,
                parentId: PARENT_COMMENT_ID,
            },
            configMock: {comments: {pagination: {limit: configLimit}}},
            contextMock: {request: {url: REQUEST_URL}},
            crudReturns: {comments: [], total: 0},
            crudReceives: [POST_ID, PARENT_COMMENT_ID, USER_ID, skip, configLimit],
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
                postId: POST_ID,
                parentId: PARENT_COMMENT_ID,
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

    DELETE_200: () => {

        return {
            request: {id: COMMENT_ID},
            crudReturns: {deleted: 1, post: {/*deleted comment*/}},
            crudReceives: [COMMENT_ID, USER_ID],
            expected: {statusCode: StatusCodes.OK},
        }
    },

    DELETE_400: () => {
        return {
            request: {id: 'invalid_input'},
            expected: {statusCode: StatusCodes.BAD_REQUEST},
        }
    },

    LIKE_200: () => {

        return {
            request: {
                id: COMMENT_ID,
                op: LikeOps.LIKE
            },
            crudReceives: [
                COMMENT_ID, USER_ID, LikeOps.LIKE
            ],
            crudReturns: 1,
            expected: {statusCode: StatusCodes.OK},
        }
    },

    UNLIKE_200: () => {

        return {
            request: {
                id: COMMENT_ID,
                op: LikeOps.UNLIKE
            },
            crudReceives: [
                COMMENT_ID, USER_ID, LikeOps.UNLIKE
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