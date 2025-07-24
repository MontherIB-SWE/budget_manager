import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

/**
 * Component for recording user income over the last 5 months.
 * Calculates and persists the average income value via UserService.
 */
@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css']
})
export class IncomeComponent {
  // Use new inject() API to retrieve the UserService instance
  private userService = inject(UserService);

  // Array to hold up to 5 salary inputs (nullable until user enters values)
  salaries: number[] = Array(5).fill(null);

  // Computed average income or null if not yet calculated
  averageIncome: number | null = null;

  // Labels for each of the 5 months (e.g., ['Mar', 'Apr', 'May', ...])
  monthLabels: string[] = [];

  /**
   * On construction, generate the month labels for the last 5 months.
   */
  constructor() {
    this.generateMonthLabels();
  }

  /**
   * Reads the salaries array, filters valid positive numbers,
   * calculates the average, updates the UI, and persists to server.
   */
  calculateAverage(): void {
    // Convert entries to numbers and remove gaps/non-positive
    const validSalaries = this.salaries
      .map(s => Number(s) || 0)
      .filter(s => s > 0);

    // If no valid entries, default to zero
    if (validSalaries.length === 0) {
      this.averageIncome = 0;
      return;
    }

    // Sum and compute average
    const total = validSalaries.reduce((sum, salary) => sum + salary, 0);
    this.averageIncome = total / validSalaries.length;

    // Persist the computed average to backend for the current user
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.userService.updateAverageIncome(userId, this.averageIncome).subscribe({
        next: () => console.log('Average income saved successfully.'),
        error: (err: unknown) => console.error('Failed to save average income', err)
      });
    }
  }

  /**
   * Generates monthLabels for the last 5 months based on today's date.
   * E.g., if today is July, labels will be ['Mar', 'Apr', 'May', 'Jun', 'Jul'].
   */
  private generateMonthLabels(): void {
    const today = new Date();
    this.monthLabels = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      this.monthLabels.push(date.toLocaleString('default', { month: 'long' }));
    }
  }

  /**
   * trackBy function for *ngFor to optimize list rendering by index
   * @param index - the current index in the list
   * @returns the index itself
   */
  trackByIndex(index: number): number {
    return index;
  }
}
