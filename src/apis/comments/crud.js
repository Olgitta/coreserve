'use strict';

const debug = require('debug')('coreserve:comments:crud');
const Comment = require('./Comment');
const {Sequelize} = require('sequelize');
const {ErrorCodes, ApiError} = require('../../core/errors');

module.exports = {
    createComment,
    deleteComment,
    getCommentsWithPagination,
    getCommentById,
    updateComment,
    updateLikes
}

async function createComment(payload) {

    const {postId, parentId} = payload;
    // Validate `parentId` if provided
    if (parentId) {
        const parentComment = await Comment.findByPk(parentId);

        if (!parentComment) {
            throw new ApiError(`Parent comment with ID ${parentId} not found.`, ErrorCodes.API_BAD_REQUEST);
        }

        // Check if `postId` matches the `postId` of the parent comment
        if (parentComment.postId !== postId) {
            throw new ApiError(`Mismatch: parent comment belongs to post ID ${parentComment.postId}, not ${postId}.`, ErrorCodes.API_BAD_REQUEST);
        }
    }

    const {dataValues} = await Comment.create(payload);

    debug('createComment', dataValues);
    return dataValues;
}

async function getCommentsWithPagination(postId, parentId, skip, limit) {
    const whereClause = {postId: postId, parentId: parentId};
    const {count, rows: comments} = await Comment.findAndCountAll({
        offset: skip,
        limit,
        order: [['updatedAt', 'DESC']],
        where: whereClause
    });

    debug(`getCommentsWithPagination:total:${count}`);
    return {
        comments,
        total: count,
    }
}

async function getCommentById(id) {
    const result = await Comment.findByPk(id);

    if (!result) {
        debug(`getCommentById:${id} not found`);
        return null;
    }

    debug(`getCommentById:${id}`, result);
    return result;
}

async function updateComment(id, payload) {
    const [affectedRows] = await Comment.update(payload, {
        where: {id: id},
    });

    if (affectedRows === 0) {
        debug(`updateComment:${id} not found or no changes made.`);
        return null;
    }

    const result = await Comment.findByPk(id);

    debug(`updateComment:${id}:`, result);
    return result;
}

async function deleteComment(id) {
    const result = await Comment.findByPk(id);
    const destroyed = await Comment.destroy({
        where: {id: id},
    });
    if (destroyed === 0) {
        debug(`deleteComment:${id} not found or no changes made.`);
        return null;
    }
    debug(`deleteComment:${id}:`, destroyed);
    return result;
}

async function updateLikes(id, like = null) {
    if (like === null) {
        throw new ApiError(`Unprocessable params on updateLikes comment with ID ${id}.`, ErrorCodes.UNPROCESSABLE_OPERATION);
    }

    const operation = like ? 'increment' : 'decrement';
    const where = like
        ? { id: id }
        : { id: id, likes: { [Sequelize.Op.gt]: 0 } };

    const [[noop, affectedRows]] = await Comment[operation]('likes', {
        by: 1,
        where: where,
    });

    debug(`updateLikes: id=${id}, operation=${operation} - affectedRows=${affectedRows}`);
    return affectedRows;
}

