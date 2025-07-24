import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TransactionService } from '../../../services/transaction.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../core/models/category.model';

/**
 * Component to generate a pie chart report of expenses per category
 * for a selected month. Updates when the @Input month changes.
 */
@Component({
  selector: 'app-category-report',
  standalone: true,
  imports: [CommonModule, NgChartsModule], // Common directives and chart module
  templateUrl: './category-report.component.html',
  styleUrls: ['./category-report.component.css']
})
export class CategoryReportComponent implements OnChanges {
  /** Selected month in 'yyyy-MM' format to filter expenses */
  @Input() month: string = '';

  // All transactions fetched from backend
  transactions: any[] = [];
  // Aggregated expense amounts keyed by category name
  categoryData: Record<string, number> = {};
  // List of category objects for mapping IDs to names
  categories: Category[] = [];
  // Mapping from category ID to category name
  categoryMap: Record<string, string> = {};
  // Sorted array of {key,value} for display & list counts
  sortedCategoryData: { key: string; value: number }[] = [];
  // Sum of all expenses in the month
  totalExpenses = 0;

  // Expose Math to template for operations like abs()
  public Math = Math;

  // Configuration for pie chart data and labels
  chartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#ffffff', font: { size: 14 } }
      }
    }
  };

  // Color palette for pie segments
  colors: string[] = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
  ];

  /**
   * @param transactionService - fetches all transactions
   * @param categoryService - fetches category list
   */
  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  /**
   * Invoked automatically when @Input() properties change.
   * Reloads categories and transactions, filters by month, aggregates data,
   * and sets up chartData and sorted display list.
   */
  ngOnChanges(): void {
    if (!this.month) return; // Do nothing if month not provided

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // 1. Load categories to build a name map
    this.categoryService.getCategories(userId).subscribe(categories => {
      this.categories = categories;
      this.categoryMap = Object.fromEntries(
        categories.map(c => [c.id, c.name])
      );

      // 2. Load all transactions then filter & aggregate
      this.transactionService.getTransactions().subscribe(data => {
        // Keep only expenses for the selected month
        this.transactions = data.filter(t =>
          t.type === 'expense' && t.date?.startsWith(this.month)
        );

        // Aggregate amounts per category
        this.categoryData = this.transactions.reduce((acc, t) => {
          const catName = typeof t.category === 'object'
            ? t.category.name
            : this.categoryMap[t.categoryId!] || 'Uncategorized';
          acc[catName] = (acc[catName] || 0) + Math.abs(t.amount);
          return acc;
        }, {} as Record<string, number>);

        // Compute total expenses
        this.totalExpenses = Object.values(this.categoryData).reduce((a, b) => a + b, 0);

        // Prepare sorted array for display
        this.sortedCategoryData = Object.entries(this.categoryData)
          .map(([key, value]) => ({ key, value }))
          .sort((a, b) => b.value - a.value);

        // Extract labels and values for the pie chart
        const labels = Object.keys(this.categoryData);
        const dataValues = Object.values(this.categoryData);
        const backgroundColors = labels.map((_, i) => this.colors[i % this.colors.length]);

        // Set chartData for the pie chart
        this.chartData = {
          labels,
          datasets: [{
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 2,
            hoverOffset: 0,
            hoverBorderColor: backgroundColors,
            hoverBackgroundColor: backgroundColors
          }]
        };
      });
    });
  }

  /**
   * Returns the number of transactions for a given category name.
   * Used in the template to display counts next to labels.
   * @param categoryName - the name of the category
   */
  countTransactions(categoryName: string): number {
    return this.transactions.filter(t => {
      const name = typeof t.category === 'object'
        ? t.category.name
        : this.categoryMap[t.categoryId!] || 'Uncategorized';
      return name === categoryName;
    }).length;
  }
}