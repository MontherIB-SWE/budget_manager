// server/services/summaryService.js

const { Op } = require('sequelize');
const Transaction = require('../models/Transaction');

/**
 * Computes a monthly summary of transactions for a given user.
 * @param {string} userId - The ID of the user whose transactions to summarize.
 * @param {string} month  - Month in 'YYYY-MM' format to define the period.
 * @returns {Promise<Object>} - An object containing `income`, `expense`, and `balance` totals.
 */
exports.monthlySummary = async (userId, month) => {
  // Construct start date at midnight on the first of the month
  const startDate = new Date(`${month}-01T00:00:00.000Z`);
  // Compute end date as start of next month (exclusive)
  const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

  // Fetch all transactions for this user within [startDate, endDate)
  const list = await Transaction.findAll({
    where: {
      userId,
      date: {
        [Op.gte]: startDate, // date >= startDate
        [Op.lt]:  endDate    // date < endDate
      }
    }
  });

  // Sum all income transactions
  const income = list
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Sum all expense transactions (amounts assumed positive or negative?)
  const expense = list
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Return the computed summary
  return {
    income,
    expense,
    balance: income - expense
  };
};