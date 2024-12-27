'use strict';

const debug = require('debug')('coreserve:posts:crud');
const Post = require('./PostModel');
const {Sequelize} = require('sequelize');

module.exports = {
    createPost,
    deletePost,
    getPosts,
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

    return Post.create(payload);
}

/**
 *
 * @param payload
 * @param payload.skip
 * @param payload.limit
 * @param filter
 * @param filter.id
 * @returns {Promise<{posts: *, total: *}>}
 */
async function  getPosts(payload, filter) {
    debug('getPosts called with:', {payload, filter});

    const {skip, limit} = payload;
    const {count, rows: posts} = await Post.findAndCountAll({
        where: filter,
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
 * @param filter
 * @param filter.id
 * @param filter.userId
 * @returns {Promise<*>}
 */
async function getPostById(filter) {
    debug('getPostById called with:', {filter});

    return Post.findOne({
        where: filter,
    });
}

/**
 *
 * @param payload
 * @param filter
 * @param filter.id
 * @param filter.userId
 * @returns {Promise<{updated: number}|{updated: *, post: *}>}
 */
async function updatePost(payload, filter) {
    debug('updatePost called with:', {payload, filter});

    const [affectedRows] = await Post.update(payload, {
        where: filter,
    });

    if (affectedRows === 0) {
        return {
            updated: 0
        }
    }

    const post = await Post.findByPk(filter.id);
    return {updated: affectedRows, post};
}

/**
 *
 * @param filter
 * @param filter.id
 * @param filter.userId
 * @returns {Promise<{deleted: *, post: *}|{deleted: number, post: *}>}
 */
async function deletePost(filter) {
    debug('deletePost called with:', {filter});
    const post = await Post.findOne({
        where: filter,
    });

    debug('deletePost going to delete:', post.id);

    if (!post) {
        return {deleted: 0, post};
    }

    const destroyed = await Post.destroy({
        where: filter,
    });

    return {deleted: destroyed, post};
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

    const [[noop, affectedRows]] = await Post[operation]('likes', {
        by: 1,
        where: where,
    });

    return affectedRows;
}

