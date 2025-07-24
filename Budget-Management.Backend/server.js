// server.js - Entry point of the Express application

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');    // Web framework for routing and middleware
const cors = require('cors');          // Enables Cross-Origin Resource Sharing
const sequelize = require('./config/database'); // Sequelize instance configured for MySQL

const app = express(); // Create Express application instance

// Test MySQL database connection on startup
sequelize.authenticate()
  .then(() => console.log('MySQL Database connected...'))
  .catch(err => console.log('Error: ' + err));

// Configure CORS to allow requests from Angular frontend
app.use(cors({
  origin: 'http://localhost:4200',    // Allowed origin (Angular dev server)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true                   // Allow cookies and auth headers
}));

app.use(express.json()); // Parse incoming JSON payloads

// Mount API route handlers
app.use('/api/auth', require('./routes/auth'));               // Authentication endpoints
app.use('/api/users', require('./routes/userRoutes'));         // User management endpoints
app.use('/api/transactions', require('./routes/transactionRoutes')); // Transaction CRUD endpoints
app.use('/api/suggestions', require('./routes/suggestionRoutes'));   // AI suggestions endpoints
app.use('/api/categories', require('./routes/categoryRoutes'));     // Category management endpoints

// Sync all Sequelize models to the database schema and start the HTTP server
sequelize.sync({ alter: true })
  .then(() => {
    const PORT = process.env.PORT || 3000; // Use environment port or default
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    console.log("Database synced with { alter: true }. All models should now match the database schema.");
  })
  .catch(err => {
    console.error("Error syncing database:", err);
  });
