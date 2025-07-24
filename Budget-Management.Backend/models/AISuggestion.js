const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');   

const AISuggestion = sequelize.define(
  'AISuggestion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',          
        key: 'id',
      },
    },

    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    tableName: 'aisuggestions',  
    timestamps: true,            
    updatedAt: false,            
  }
);

module.exports = AISuggestion;
