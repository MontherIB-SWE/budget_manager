import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

import { TransactionService } from '../../../services/transaction.service';
import { CategoryService } from '../../../services/category.service';
import { Transaction } from '../../../core/models/transaction.model';
import { Category } from '../../../core/models/category.model';

/**
 * Component to display a bar chart of monthly expenses per category.
 * Updates whenever the @Input() selectedMonth changes.
 */
@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './monthly-report.component.html',
  styleUrls: ['./monthly-report.component.css']
})
export class MonthlyReportComponent implements OnChanges {
  /**
   * The selected month in 'yyyy-MM' format used to filter transactions.
   */
  @Input() selectedMonth: string = '';

  // All filtered transactions for the selected month
  transactions: Transaction[] = [];
  // List of category definitions fetched from the backend
  categories: Category[] = [];
  // Totals of expenses keyed by category name
  categoryTotals: Record<string, number> = {};
  // Expose Math for template calculations (e.g., abs())
  public Math = Math;

  // Configuration for bar chart data
  chartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  // Options for bar chart styling and labels
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#ffffff' } },
      title: { display: true, text: 'Expenses by Category', color: '#ffffff', font: { size: 14 } }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Format ticks as currency
          callback: (value: any) => '$' + value.toLocaleString(),
          color: '#bcbcbcff'
        }
      },
      x: {
        ticks: { color: '#bcbcbcff' }
      }
    }
  };

  /**
   * Injects services for fetching transactions and categories.
   * @param transactionService - service to retrieve transaction data
   * @param categoryService - service to retrieve category data
   */
  constructor(
    private transactionService: TransactionService,
    private categoryService   : CategoryService
  ) {}

  /**
   * Runs whenever the @Input selectedMonth changes.
   * Loads categories and transactions, filters, aggregates totals,
   * and prepares bar chart data.
   */
  ngOnChanges(): void {
    if (!this.selectedMonth) return;  // No action if month not set

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Fetch categories to map IDs to names
    this.categoryService.getCategories(userId).subscribe({
      next: (cats) => {
        this.categories = cats;

        // Fetch all transactions then filter for the selected month
        this.transactionService.getTransactions().subscribe((data) => {
          this.transactions = data.filter(t => t.date?.startsWith(this.selectedMonth));

          // Aggregate expense totals per category
          this.categoryTotals = this.transactions.reduce((acc, t) => {
            if (t.type === 'expense') {
              const catName = this.getCategoryName(t.categoryId);
              acc[catName] = (acc[catName] || 0) + Math.abs(t.amount);
            }
            return acc;
          }, {} as Record<string, number>);

          // Build chart data from the aggregated totals
          this.chartData = {
            labels: Object.keys(this.categoryTotals),
            datasets: [{
              label: 'Expenses by Category',
              data: Object.values(this.categoryTotals),
              backgroundColor: [
                '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
                '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
              ]
            }]
          };
        });
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  /**
   * Looks up the category name by its ID. Falls back to 'Uncategorized'.
   * @param id - category ID from the transaction
   * @returns the category name string
   */
  getCategoryName(id: number | string | undefined): string {
    if (id == null) return 'Uncategorized';
    const found = this.categories.find(c => c.id == id);
    return found ? found.name : 'Uncategorized';
  }
}
