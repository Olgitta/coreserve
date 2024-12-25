'use strict';

const debug = require('debug')('coreserve:posts:crud');
const Post = require('./Post');
const {Sequelize} = require('sequelize');
const {ApiError, ApiErrorCodes} = require('../../core/errors');

module.exports = {
    createPost,
    deletePost,
    getPostsWithPagination,
    getPostById,
    updatePost,
    updateLikes
}

/**
 *
 * @param payload
 * @param payload.userId
 * @param payload.title
 * @param payload.content
 * @returns {Promise<*>}
 */
async function createPost(payload) {
    debug('createPost called with:', payload);

    return await Post.create(payload);
}

/**
 *
 * @param userId
 * @param skip
 * @param limit
 * @returns {Promise<{posts: *, total: *}>}
 */
async function  getPostsWithPagination(userId, skip, limit) {
    debug('getPostsWithPagination called with:', {userId, skip, limit});
    const {count, rows: posts} = await Post.findAndCountAll({
        where: {userId: userId},
        offset: skip,
        limit,
        order: [['updatedAt', 'DESC']],
    });

    return {
        posts,
        total: count,
    }
}

/**
 *
 * @param id
 * @param userId
 * @returns {Promise<*>}
 */
async function getPostById(id, userId) {
    debug('getPostById called with:', {id, userId});

    return await Post.findOne({
        where: {
            id: id,
            userId: userId
        },
    });
}

/**
 *
 * @param id
 * @param userId
 * @param payload
 * @returns {Promise<{updated: number}|{updated: *, post: *}>}
 */
async function updatePost(id, userId, payload) {
    debug('updatePost called with:', {id, userId, ...payload});
    const [affectedRows] = await Post.update(payload, {
        where: {
            id: id,
            userId: userId
        },
    });

    if (affectedRows === 0) {
        return {
            updated: 0
        }
    }

    const post = await Post.findByPk(id);
    return {updated: affectedRows, post};
}

/**
 *
 * @param id
 * @param userId
 * @returns {Promise<{deleted: *, post: *}|{deleted: number, post: *}>}
 */
async function deletePost(id, userId) {
    debug('deletePost called with:', {id, userId});
    const post = await Post.findOne({
        where: {
            id: id,
            userId: userId
        },
    });

    debug('deletePost going to delete:', post);

    if (!post) {
        return {deleted: 0, post};
    }

    const destroyed = await Post.destroy({
        where: {
            id: id,
            userId: userId
        },
    });

    return {deleted: destroyed, post};
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

    const [[noop, affectedRows]] = await Post[operation]('likes', {
        by: 1,
        where: where,
    });

    return affectedRows;
}

