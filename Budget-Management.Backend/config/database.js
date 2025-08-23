const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING, {
  dialect: 'postgres', // Use postgres
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Neon
    }
  }
});

module.exports = sequelize;