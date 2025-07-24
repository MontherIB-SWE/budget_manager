// Import Sequelize constructor from the sequelize package
const { Sequelize } = require('sequelize');

// Create a new Sequelize instance, connecting to the 'budget' database
// User: 'root', Password: '12345', Host: 'localhost', using MySQL dialect
const sequelize = new Sequelize('budget', 'root', '12345', {
  host: 'localhost',   // Database server hostname
  dialect: 'mysql'     // Dialect indicates the type of database (MySQL)
});

// Export the configured Sequelize instance for use in other modules
module.exports = sequelize;
