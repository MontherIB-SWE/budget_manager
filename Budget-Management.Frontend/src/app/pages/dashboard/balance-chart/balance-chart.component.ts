import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartData } from 'chart.js';
import { subMonths, format } from 'date-fns';
import { NgChartsModule } from 'ng2-charts';
import { TransactionService } from '../../../services/transaction.service';
import { CommonModule } from '@angular/common';

interface MonthData {
  key: string;   // e.g., '2025-07' used to filter transaction dates
  label: string; // e.g., 'Jul 25' used as X-axis labels on the chart
}

/**
 * Component that displays a line chart of income vs. expenses
 * over the past 7 months using ng2-charts.
 */
@Component({
  selector: 'app-balance-chart',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './balance-chart.component.html',
  styleUrls: ['./balance-chart.component.css']
})
export class BalanceChartComponent implements OnInit {
  // Chart data structure for a line chart: labels and two datasets
  public chartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  // Chart configuration options for responsiveness and styling
  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {                     // X-axis styling
        ticks: { color: '#ffffff' },
        grid: { display: false }
      },
      y: {                     // Y-axis styling
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    },
    plugins: {
      legend: { labels: { color: '#ffffff' } } // Legend text color
    },
    elements: {
      line: { tension: 0.4 }  // Smooth curves between points
    }
  };

  /**
   * @param txService - service to fetch all transactions from the backend
   */
  constructor(private txService: TransactionService) {}

  /**
   * On init, fetch transactions and prepare the chart data
   */
  ngOnInit(): void {
    this.txService.getTransactions().subscribe(transactions => {
      // 1. Build an array of the last 7 months with keys and labels
      const months: MonthData[] = Array.from({ length: 7 }).map((_, i) => {
        const date = subMonths(new Date(), 6 - i);
        return {
          key: format(date, 'yyyy-MM'),
          label: format(date, 'MMM yy')
        };
      });

      // 2. Calculate total income per month by filtering and summing
      const incomes = months.map(m =>
        transactions
          .filter(t => t.type === 'income' && t.date.startsWith(m.key))
          .reduce((sum, t) => sum + t.amount, 0)
      );

      // 3. Calculate total expenses per month similarly
      const expenses = months.map(m =>
        transactions
          .filter(t => t.type === 'expense' && t.date.startsWith(m.key))
          .reduce((sum, t) => sum + t.amount, 0)
      );

      // 4. Assign the computed arrays to the chart data object
      this.chartData = {
        labels: months.map(m => m.label),
        datasets: [
          {
            label: 'Income',
            data: incomes,
            fill: true         // Fill area under the income line
          },
          {
            label: 'Expenses',
            data: expenses,
            fill: true         // Fill area under the expenses line
          }
        ]
      };
    });
  }
}
