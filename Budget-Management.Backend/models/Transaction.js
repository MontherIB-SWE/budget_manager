const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'users', 
        key: 'id'
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    references: {
        model: 'categories', 
        key: 'id'
    }
  },
  type: {
  type: DataTypes.ENUM('income', 'expense'),
  allowNull: false
  }
}, {
  tableName: 'transactions',
  timestamps: false
});

module.exports = Transaction;
