
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * POST /api/auth/login
 * Authenticates a user using email and password.
 * Expects `email` and `password` in request body.
 * Responses:
 *   - 200: Returns the user object if credentials match.
 *   - 401: Invalid email or password.
 *   - 500: Internal server error.
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Authentication successful
    res.json({ user });
  } catch (err) {
    // Handle unexpected errors
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/auth/register
 * Registers a new user.
 * Expects `name`, `email`, `password`, and optional `phone` in request body.
 * Responses:
 *   - 201: Created user object.
 *   - 400: Missing required fields or email already in use.
 *   - 500: Internal server error.
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check for existing user with same email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Create new user record
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/users/:id
 * Retrieves user details by primary key.
 * Path Parameter:
 *   - id: user ID to fetch.
 * Responses:
 *   - 200: User object.
 *   - 404: User not found.
 *   - 500: Internal server error.
 */
exports.getUserById = async (req, res) => {
  try {
    // Fetch user by primary key
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/users/:id/income
 * Updates the averageIncome field of a user.
 * Path Parameter:
 *   - id: user ID to update.
 * Body Parameter:
 *   - averageIncome: new average income value.
 * Responses:
 *   - 200: Updated user object.
 *   - 404: User not found.
 *   - 500: Internal server error.
 */
exports.updateUserIncome = async (req, res) => {
  try {
    // Find user by primary key
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the averageIncome field and save
    user.averageIncome = req.body.averageIncome;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
