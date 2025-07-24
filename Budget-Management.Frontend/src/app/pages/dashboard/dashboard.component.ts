import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { NgChartsModule } from 'ng2-charts';

import { TransactionService } from '../../services/transaction.service';  
import { BalanceChartComponent } from './balance-chart/balance-chart.component'; 
import { User } from '../../core/models/user.model'; 
import { UserService } from '../../services/user.service'; 

/**
 * Dashboard component that shows user greeting, financial summary,
 * average income, and includes a balance chart for visualization.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, BalanceChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentMonthLabel = format(new Date(), 'MMMM yyyy');

  summary = { income: 0, expenses: 0, balance: 0 };

  userName: string = '';
  averageIncome: number = 0;

  /**
   * @param txService - used to fetch monthly income/expense summary
   * @param userService - used to fetch current user details
   */
  constructor(
    private txService: TransactionService,
    private userService: UserService
  ) {}

  /**
   * On component initialization:
   * 1. Load current user to display name & average income.
   * 2. Load summary (income, expenses, balance) for the dashboard.
   */
  ngOnInit(): void {
    // Fetch and assign current user data
    this.userService.getCurrentUser()?.subscribe({
      next: (user: User) => {
        this.userName = user.name || '';
        this.averageIncome = user.averageIncome || 0;
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      }
    });

    // Fetch and assign financial summary for current month
    this.txService.getSummary().subscribe(data => {
      this.summary = {
        income: data.income,
        expenses: data.expenses,
        balance: data.balance
      };
    });
  }
}
