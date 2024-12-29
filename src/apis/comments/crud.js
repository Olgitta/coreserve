'use strict';

const debug = require('debug')('coreserve:comments:crud');
const Comment = require('./CommentModel');
const {Sequelize} = require('sequelize');

module.exports = {
    createComment,
    deleteComment,
    getComments,
    updateLikes
}

/**
 *
 * @param payload
 * @param payload.postId
 * @param payload.parentId
 * @param payload.userId
 * @param payload.content
 * @returns {Promise<*>}
 */
async function createComment(payload) {
    debug('createComment called with:', payload);

    return Comment.create(payload);
}

/**
 *
 * @param payload
 * @param payload.skip
 * @param payload.limit
 * @param filter
 * @param filter.postId
 * @param filter.parentId
 * @param filter.userId
 * @returns {Promise<{comments: *, total: *}>}
 */
async function getComments(payload, filter) {
    debug('getComments called with:', {payload, filter});

    const {skip, limit} = payload;
    const {count, rows: comments} = await Comment.findAndCountAll({
        offset: skip,
        limit,
        order: [['updatedAt', 'DESC']],
        where: filter
    });

    return {
        comments,
        total: count,
    }
}

/**
 *
 * @param filter
 * @param filter.id
 * @param filter.userId
 * @returns {Promise<*>}
 */
async function deleteComment(filter) {
    debug('deleteComment called with:', {filter});

    return await Comment.destroy({
        where: filter
    });
}

/**
 *
 * @param payload
 * @param payload.like
 * @param filter
 * @param filter.id
 * @param filter.userId
 * @returns {Promise<*>}
 */
async function updateLikes(payload, filter) {
    debug('updateLikes called with:', {payload, filter});

    const {like} = payload;
    const operation = like ? 'increment' : 'decrement';
    const where = like
        ? {...filter}
        : {...filter, likes: {[Sequelize.Op.gt]: 0}};

    const [[noop, affectedRows]] = await Comment[operation]('likes', {
        by: 1,
        where: where,
    });

    return affectedRows;
}
