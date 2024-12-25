'use strict';

const {DataTypes} = require('sequelize');
const {createModel} = require('../../infra/db/mysql/connection');

const Post = createModel('Post', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            references: {
                model: 'users', // Name of the target table
                key: 'id',      // Key in the target table
            },
            onDelete: 'CASCADE', // Define behavior on delete
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
