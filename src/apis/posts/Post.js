'use strict';

const {DataTypes} = require('sequelize');
const {createModel} = require('../../infra/db/mysql/connection');

const Post = createModel('Post', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at', // Map to 'created_at' in DB
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at', // Map to 'updated_at' in DB
        },
    },
    {
        timestamps: true,
        tableName: 'posts',
    });

module.exports = Post;
