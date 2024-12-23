'use strict';

const debug = require('debug')('coreserve:posts:crud');
const Post = require('./Post');
const {Sequelize} = require('sequelize');
const {ApiError, ErrorCodes} = require('../../core/errors');

module.exports = {
    createPost,
    deletePost,
    getPostsWithPagination,
    getPostById,
    updatePost,
    updateLikes
}

async function createPost(payload) {
    const {dataValues} = await Post.create(payload);

    debug('createPost', dataValues);
    return dataValues;
}

async function getPostsWithPagination(skip, limit) {
    const {count, rows: posts} = await Post.findAndCountAll({
        offset: skip,
        limit,
        order: [['updatedAt', 'DESC']],
    });

    debug(`getPostsWithPagination:total:${count}`);
    return {
        posts,
        total: count,
    }
}

async function getPostById(id) {
    const post = await Post.findByPk(id);

    if (!post) {
        debug(`getPostById:${id} not found`);
        return null;
    }

    debug(`getPostById:${id}`, post.dataValues);
    return post;
}

async function updatePost(id, payload) {
    const [affectedRows] = await Post.update(payload, {
        where: {id: id},
    });

    if (affectedRows === 0) {
        debug(`updatePost:${id} not found or no changes made.`);
        return null;
    }

    const post = await Post.findByPk(id);

    debug(`updatePost:${id}:`, post.dataValues);
    return post;
}

async function deletePost(id) {
    const post = await Post.findByPk(id);
    const destroyed = await Post.destroy({
        where: {id: id},
    });
    if (destroyed === 0) {
        debug(`deletePost:${id} not found or no changes made.`);
        return null;
    }
    debug(`deletePost:${id}:`, destroyed);
    return post;
}

async function updateLikes(id, like = null) {
    if (like === null) {
        throw new ApiError(`Unprocessable params on updateLikes comment with ID ${id}.`, ErrorCodes.UNPROCESSABLE_OPERATION);
    }

    const operation = like ? 'increment' : 'decrement';
    const where = like
        ? { id: id }
        : { id: id, likes: { [Sequelize.Op.gt]: 0 } };

    const [[noop, affectedRows]] = await Post[operation]('likes', {
        by: 1,
        where: where,
    });

    debug(`updateLikes: id=${id}, operation=${operation} - affectedRows=${affectedRows}`);
    return affectedRows;
}

