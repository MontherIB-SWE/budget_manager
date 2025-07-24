import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { format, subMonths, endOfMonth } from 'date-fns';
import { TransactionService } from '../../services/transaction.service';
import { MonthlyReportComponent } from './monthly-report/monthly-report.component';
import { CategoryReportComponent } from './category-report/category-report.component';
import { CategoryService } from '../../services/category.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * ReportsComponent provides UI for selecting a month,
 * viewing monthly and category breakdown charts,
 * and exporting the report to PDF or CSV formats.
 */
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MonthlyReportComponent,   // Child component for bar chart
    CategoryReportComponent   // Child component for pie chart
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  /**
   * Month in 'yyyy-MM' used to filter transactions and generate reports.
   */
  selectedMonth: string = format(new Date(), 'yyyy-MM');

  /**
   * Type of report: 'monthly' or 'category'. Affects displayed chart.
   */
  reportType: string = 'monthly';

  /**
   * Array of past 12 months in 'yyyy-MM' format for dropdown selection.
   */
  months: string[] = [];

  /**
   * Total income and expenses for the selected month.
   */
  monthlyData = { income: 0, expenses: 0 };

  /**
   * Aggregated data by category for income and expenses.
   */
  incomeCategoryData: Record<string, number> = {};
  expenseCategoryData: Record<string, number> = {};

  /**
   * List of transactions filtered by selected month.
   */
  transactions: any[] = [];

  /**
   * Mapping of category IDs to their names.
   */
  categoryMap: Record<string, string> = {};

  /**
   * Inject services for fetching transactions and categories.
   */
  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) { }

  /**
   * Initialize component:
   * 1. Build the month list for selection.
   * 2. Load data for the initial selected month.
   */
  ngOnInit(): void {
    this.generateMonthList();
    this.loadData();
  }

  /**
   * Populates `months` with the last 12 months.
   */
  generateMonthList(): void {
    for (let i = 0; i < 12; i++) {
      const month = format(subMonths(new Date(), i), 'yyyy-MM');
      this.months.push(month);
    }
  }

  /**
   * Fetches categories and transactions, then computes:
   * - monthly totals
   * - breakdown per category for income and expenses
   */
  loadData(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Fetch categories first to build the map
    this.categoryService.getCategories(userId).subscribe(categories => {
      this.categoryMap = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {} as Record<string, string>);

      // Fetch transactions and filter by the selected month
      this.transactionService.getTransactions().subscribe(transactions => {
        const filtered = transactions.filter(t => t.date?.startsWith(this.selectedMonth));
        this.transactions = filtered;

        // Compute overall income and expenses
        this.monthlyData.income = filtered
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        this.monthlyData.expenses = filtered
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Reset category aggregations
        this.incomeCategoryData = {};
        this.expenseCategoryData = {};

        // Aggregate by category
        filtered.forEach(t => {
          const name = this.categoryMap[t.categoryId] || 'Uncategorized';
          if (t.type === 'income') {
            this.incomeCategoryData[name] = (this.incomeCategoryData[name] || 0) + t.amount;
          } else if (t.type === 'expense') {
            this.expenseCategoryData[name] = (this.expenseCategoryData[name] || 0) + Math.abs(t.amount);
          }
        });
      });
    });
  }

  /**
   * Triggered when the month dropdown value changes.
   * Reloads data for the new month.
   */
  onMonthChange(): void {
    this.loadData();
  }

  /**
   * Exports the current report view to a PDF file.
   * Uses jsPDF and autoTable to format text and tables.
   */
  exportToPDF(): void {
    const doc = new jsPDF();
    const title = `Financial Report for ${this.selectedMonth}`;
    const period = this.getReportPeriod();
    const netSavings = this.getNetSavings();
    const positive = this.isSavingsPositive();

    // Title and header info
    doc.setFontSize(16);
    doc.text(title, 10, 10);
    doc.setFontSize(12);
    doc.text(`Period: ${period}`, 10, 20);
    doc.text(`Income: $${this.monthlyData.income.toLocaleString()}`, 10, 30);
    doc.text(`Expenses: $${this.monthlyData.expenses.toLocaleString()}`, 10, 40);
    doc.text(`Net Savings: $${netSavings.toLocaleString()}`, 10, 50);

    // Color-coded savings indicator
    doc.setTextColor(positive ? 'green' : 'red');
    doc.text(positive ? 'Positive Savings' : 'Negative Savings', 10, 60);
    doc.setTextColor('black');

    // Income breakdown table
    doc.text('Income Breakdown', 10, 70);
    autoTable(doc, {
      startY: 75,
      head: [['Category', 'Amount']],
      body: Object.entries(this.incomeCategoryData).map(([cat, amt]) => [cat, `$${amt.toLocaleString()}`])
    });

    // Expense breakdown table below income table
    const afterIncome = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Expense Breakdown', 10, afterIncome);
    autoTable(doc, {
      startY: afterIncome + 5,
      head: [['Category', 'Amount']],
      body: Object.entries(this.expenseCategoryData).map(([cat, amt]) => [cat, `$${amt.toLocaleString()}`])
    });

    // Detailed transaction table
    const afterExpense = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Transaction Details', 10, afterExpense);
    autoTable(doc, {
      startY: afterExpense + 5,
      head: [['Date', 'Description', 'Category', 'Amount', 'Type']],
      body: this.transactions.map(t => [
        t.date,
        t.description || '',
        this.categoryMap[t.categoryId] || 'Uncategorized',
        `$${Math.abs(t.amount).toLocaleString()}`,
        t.type
      ])
    });

    doc.save(`financial-report-${this.selectedMonth}.pdf`);
  }

  /**
   * Exports the filtered transactions to a CSV file.
   */
  exportToCSV(): void {
    const rows = [
      ['Date', 'Description', 'Category', 'Amount', 'Type'],
      ...this.transactions.map(t => [
        t.date,
        t.description,
        this.categoryMap[t.categoryId] || 'Uncategorized',
        t.amount,
        t.type
      ])
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

    const link = document.createElement('a');
    link.href = uri;
    link.download = `transactions-${this.selectedMonth}.csv`;
    link.click();
  }

  /**
   * Computes human-readable start and end dates for the selected month.
   */
  getReportPeriod(): string {
    const start = format(new Date(this.selectedMonth + '-01'), 'MMM d');
    const end = format(endOfMonth(new Date(this.selectedMonth + '-01')), 'MMM d, yyyy');
    return `${start} - ${end}`;
  }

  /**
   * Calculates net savings (income minus expenses).
   */
  getNetSavings(): number {
    return this.monthlyData.income - this.monthlyData.expenses;
  }

  /**
   * Determines whether net savings is non-negative.
   */
  isSavingsPositive(): boolean {
    return this.getNetSavings() >= 0;
  }
}
