'use strict';

const {DataTypes} = require('sequelize');
const {createModel} = require('../../infra/db/mysql/connection');

const CommentModel = createModel('Comment', {
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
        postId: {
            type: DataTypes.INTEGER,
            field: 'post_id',
            // foreignKey: true,
            allowNull: false,
            references: {
                model: 'posts', // Name of the target table
                key: 'id',      // Key in the target table
            },
            onDelete: 'CASCADE', // Define behavior on delete
        },
        parentId: {
            type: DataTypes.INTEGER,
            field: 'parent_id',
            // foreignKey: true,
            allowNull: true,
            references: {
                model: 'comments', // Self-referencing foreign key
                key: 'id',
            },
            onDelete: 'CASCADE',
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
        tableName: 'comments',
    });

module.exports = CommentModel;
