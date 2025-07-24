import { Injectable } from '@angular/core';

/**
 * Mock data service for reports, providing hardcoded transaction data
 * and methods to derive summary statistics without a backend.
 */
@Injectable({ providedIn: 'root' })
export class ReportsDataService {
  /**
   * Hardcoded list of transactions used for generating reports.
   * - Negative amounts represent expenses.
   * - Positive amounts represent income.
   */
  private transactions = [
    {
      id: 1,
      date: '2025-07-01',
      description: 'Groceries',
      category: 'Food',
      amount: -150,
      type: 'expense'
    },
    {
      id: 2,
      date: '2025-07-05',
      description: 'Salary',
      category: 'Income',
      amount: 3000,
      type: 'income'
    },
    {
      id: 3,
      date: '2025-07-10',
      description: 'Utilities',
      category: 'Bills',
      amount: -120,
      type: 'expense'
    }
    // Add more mock data objects as needed
  ];

  /**
   * Returns the full list of mock transactions.
   * @returns Array of transaction objects
   */
  getTransactions(): any[] {
    return this.transactions;
  }

  /**
   * Calculates total income and expenses for a given month.
   * @param month - Month string in 'yyyy-MM' format used to filter by date prefix
   * @returns Object containing `income` and `expenses` totals
   */
  getMonthlyData(month: string): { income: number; expenses: number } {
    // Filter transactions by month prefix
    const monthlyTransactions = this.transactions.filter(t =>
      t.date.startsWith(month)
    );

    // Sum positive amounts for income
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Sum absolute values of negative amounts for expenses
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expenses };
  }

  /**
   * Aggregates total expenses by category across all transactions.
   * @returns Record mapping category names to total expense amounts
   */
  getCategoryData(): Record<string, number> {
    const result: Record<string, number> = {};

    // Loop through transactions and accumulate absolute expense amounts
    for (const t of this.transactions) {
      if (t.type === 'expense') {
        result[t.category] = (result[t.category] || 0) + Math.abs(t.amount);
      }
    }

    return result;
  }
}
