'use strict';

const debug = require('debug')('coreserve:comments:crud');
const Comment = require('./Comment');
const {Sequelize} = require('sequelize');

module.exports = {
    createComment,
    deleteComment,
    getCommentsWithPagination,
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

    return await Comment.create(payload);
}

/**
 *
 * @param postId
 * @param parentId
 * @param userId
 * @param skip
 * @param limit
 * @returns {Promise<{comments: *, total: *}>}
 */
async function getCommentsWithPagination(postId, parentId, userId, skip, limit) {
    debug('getCommentsWithPagination called with:', {postId, parentId, userId, skip, limit});

    const whereClause = {postId: postId, parentId: parentId, userId: userId};
    const {count, rows: comments} = await Comment.findAndCountAll({
        offset: skip,
        limit,
        order: [['updatedAt', 'DESC']],
        where: whereClause
    });

    return {
        comments,
        total: count,
    }
}

// async function getCommentById(id) {
//     const result = await Comment.findByPk(id);
//
//     if (!result) {
//         debug(`getCommentById:${id} not found`);
//         return null;
//     }
//
//     debug(`getCommentById:${id}`, result);
//     return result;
// }

// async function updateComment(id, payload) {
//     const [affectedRows] = await Comment.update(payload, {
//         where: {id: id},
//     });
//
//     if (affectedRows === 0) {
//         debug(`updateComment:${id} not found or no changes made.`);
//         return null;
//     }
//
//     const result = await Comment.findByPk(id);
//
//     debug(`updateComment:${id}:`, result);
//     return result;
// }

/**
 *
 * @param id
 * @param userId
 * @returns {Promise<{deleted: *, comment: *}>}
 */
async function deleteComment(id, userId) {
    debug('deleteComment called with:', {id, userId});

    const result = await Comment.findOne({
        where: {
            id: id,
            userId: userId,
        }
    });

    debug('deleteComment going to delete:', result);

    const destroyed = await Comment.destroy({
        where: {
            id: id,
            userId: userId
        },
    });

    return {deleted: destroyed, comment: result};
}

/**
 *
 * @param id
 * @param userId
 * @param like
 * @returns {Promise<*>}
 */
async function updateLikes(id, userId, like) {
    debug('updateLikes called with:', {id, userId, like});

    const operation = like ? 'increment' : 'decrement';
    const where = like
        ? {id: id, userId: userId}
        : {id: id, userId: userId, likes: {[Sequelize.Op.gt]: 0}};

    const [[noop, affectedRows]] = await Comment[operation]('likes', {
        by: 1,
        where: where,
    });

    return affectedRows;
}
