import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { ToastrService }     from 'ngx-toastr';              

import { TransactionService } from '../../services/transaction.service';
import { CategoryService }    from '../../services/category.service';

import { Transaction } from '../../core/models/transaction.model';
import { Category }    from '../../core/models/category.model';

/**
 * TransactionsComponent manages listing, creation, and deletion
 * of financial transactions, as well as category management.
 */
@Component({
  selector   : 'app-transactions',
  standalone : true,
  imports    : [CommonModule, FormsModule], // Enables common directives and template-driven forms
  templateUrl: './transactions.component.html',
  styleUrls  : ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  /**
   * Array holding all fetched transactions for display
   */
  transactions: Transaction[] = [];

  /**
   * Array of available categories for new transaction selection
   */
  categories: Category[] = [];

  /**
   * Holds the new transaction data bound to form inputs
   */
  newTransaction: Partial<Transaction> = {
    type       : 'income',            // Default type
    amount     : 0,
    description: '',
    date       : this.getTodayDate(), // Initialized to today
    categoryId : undefined
  };

  /**
   * Toggles visibility of the new-category input box
   */
  showAddCategoryInput = false;

  /**
   * Temporary holder for the new category name input
   */
  newCategoryName = '';

  /**
   * Inject core services: transactions, categories, and toast notifications
   */
  constructor(
    private transactionService: TransactionService,
    private categoryService   : CategoryService,
    private toastr            : ToastrService
  ) {}

  /**
   * Lifecycle hook: on init, show boot toast and load data
   */
  ngOnInit(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  /**
   * Utility to get today's date in 'YYYY-MM-DD' format
   */
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Fetches all transactions from backend and updates the list
   */
  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe({
      next : data => (this.transactions = data),
      error: err  => console.error('Failed to load transactions:', err)
    });
  }

  /**
   * Fetches categories for the current user to populate the dropdown
   */
  loadCategories(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.categoryService.getCategories(userId).subscribe({
      next : data => (this.categories = data),
      error: err  => console.error('Failed to load categories:', err)
    });
  }

  /**
   * Validates and sends a request to add a new transaction,
   * then reloads list and resets form on success.
   */
  addTransaction(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const { amount, type, date, categoryId } = this.newTransaction;
    if (!amount || !type || !date || !categoryId) {
      alert('Please fill in all required fields, including category.');
      return;
    }

    const transaction: Transaction = {
      ...this.newTransaction,
      userId
    } as Transaction;

    this.transactionService.createTransaction(transaction).subscribe({
      next : () => {
        this.loadTransactions();         // Refresh the list
        this.resetForm();               // Clear inputs
        this.toastr.success('Transaction added!', 'Success');
      },
      error: err => {
        console.error('Failed to add transaction:', err);
        this.toastr.error('Could not add transaction', 'Error');
      }
    });
  }

  /**
   * Sends a request to delete a transaction by ID,
   * then reloads the list on success.
   * @param id - The transaction ID to delete
   */
  deleteTransaction(id: string): void {
    if (!id) return;

    this.transactionService.deleteTransaction(id).subscribe({
      next : () => {
        this.loadTransactions();         // Refresh list
        this.toastr.success('Transaction deleted', 'Success');
      },
      error: err => {
        console.error('Failed to delete transaction:', err);
        this.toastr.error('Delete failed', 'Error');
      }
    });
  }

  /**
   * Toggles the display of the new category input section
   */
  toggleAddCategory(): void {
    this.showAddCategoryInput = !this.showAddCategoryInput;
    this.newCategoryName = '';
  }

  /**
   * Adds a new category, pushes it into the categories array,
   * and selects it for the new transaction.
   */
  addNewCategory(): void {
    const userId = localStorage.getItem('userId');
    if (!userId || !this.newCategoryName.trim()) {
      alert('Please enter a category name.');
      return;
    }

    const newCategory: Partial<Category> = {
      name  : this.newCategoryName.trim(),
      userId
    };

    this.categoryService.createCategory(newCategory as Category).subscribe({
      next : created => {
        this.categories.push(created);          // Add to dropdown
        this.newTransaction.categoryId = created.id;  // Pre-select
        this.showAddCategoryInput = false;      // Hide input
        this.toastr.success('Category added!', 'Success');
      },
      error: err => {
        console.error('Failed to add category:', err);
        this.toastr.error('Could not add category', 'Error');
      }
    });
  }

  /**
   * Resets the newTransaction object to default values
   */
  resetForm(): void {
    this.newTransaction = {
      type       : 'income',
      amount     : 0,
      description: '',
      date       : this.getTodayDate(),
      categoryId : undefined
    };
  }

  /**
   * Helper to get display name for a category by ID,
   * returns 'Unknown' if not found.
   * @param id - Category ID
   * @returns Category name or placeholder string
   */
  getCategoryName(id: number | string | undefined): string {
    if (id == null) return 'N/A';
    const cat = this.categories.find(c => c.id == id);
    return cat ? cat.name : 'Unknown';
  }
}
