const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

/**
 * POST /api/transactions
 * Creates a new transaction record in the database.
 * Expects `userId`, `type`, `amount`, `date`, and optionally other fields in req.body.
 * Validates presence of userId and correct `type` value ('income' or 'expense').
 * Responses:
 *  - 201: Created transaction object.
 *  - 400: Missing userId or invalid type, or creation error.
 */
exports.createTransaction = async (req, res) => {
  try {
    // Ensure userId is provided for ownership
    if (!req.body.userId) {
      return res.status(400).json({ error: 'userId is required in the request body.' });
    }
    const { type } = req.body;

    // Validate transaction type
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Transaction type must be either "income" or "expense".' });
    }

    // Create and persist the transaction record
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    // Validation or database error
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/transactions?userId=<id>
 * Retrieves all transactions belonging to a specified user.
 * Query Parameters:
 *  - userId: (string) ID of the user whose transactions to fetch.
 * Responses:
 *  - 200: Array of transaction objects.
 *  - 400: Missing userId parameter.
 *  - 500: Internal server error.
 */
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'A userId query parameter is required.' });
    }

    // Fetch transactions filtered by userId
    const transactions = await Transaction.findAll({ where: { userId } });
    res.json(transactions);
  } catch (err) {
    // Unexpected error
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/transactions/:id
 * Updates a specific transaction, verifying ownership by userId.
 * Path Parameter:
 *  - id: (string) ID of the transaction to update.
 * Body Parameters:
 *  - userId: (string) ID of the user requesting the update.
 *  - other fields to modify.
 * Responses:
 *  - 200: Updated transaction object.
 *  - 400: Missing userId or update error.
 *  - 404: Transaction not found or not owned by user.
 */
exports.updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required in the request body to verify ownership.' });
    }

    // Find the transaction by id and userId to enforce ownership
    const transaction = await Transaction.findOne({ where: { id: transactionId, userId } });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or you do not have permission to edit it.' });
    }

    // Apply updates and save
    const updatedTransaction = await transaction.update(req.body);
    res.json(updatedTransaction);
  } catch (err) {
    // Validation or update error
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction, verifying ownership by userId query parameter.
 * Path Parameter:
 *  - id: (string) ID of the transaction to delete.
 * Query Parameter:
 *  - userId: (string) ID of the user requesting deletion.
 * Responses:
 *  - 204: No Content on successful deletion.
 *  - 400: Missing userId parameter.
 *  - 404: Transaction not found or not owned by user.
 *  - 500: Internal server error.
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'A userId query parameter is required to verify ownership.' });
    }

    // Find the transaction by id and userId
    const transaction = await Transaction.findOne({ where: { id: transactionId, userId } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or you do not have permission to delete it.' });
    }

    // Delete the transaction
    await transaction.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/transactions/summary?userId=<id>
 * Retrieves a summary (income, expenses, balance) for the current month for a user.
 * Query Parameter:
 *  - userId: (string) ID of the user.
 * Responses:
 *  - 200: JSON with keys { income, expenses, balance }.
 *  - 400: Missing userId parameter.
 *  - 500: Internal server error.
 */
exports.getMonthlySummary = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required in query params.' });
    }

    // Calculate date range: start of month to now
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfToday = now;

    // Fetch transactions in the date range for this user
    const transactions = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startOfThisMonth, endOfToday]
        }
      }
    });

    // Aggregate income and expenses
    let income = 0;
    let expenses = 0;
    transactions.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense') expenses += tx.amount;
    });

    // Return the summary object
    res.json({
      income,
      expenses,
      balance: income - expenses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
