// models/Category.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: 'users', 
            key: 'id'
        }
    }
}, {
    tableName: 'categories',
    timestamps: false 
});

module.exports = Category;