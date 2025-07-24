import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

/**
 * Service for managing transactions via HTTP API.
 * Provides CRUD operations and summary retrieval for the authenticated user.
 */
@Injectable({
  providedIn: 'root'  // Available throughout the application
})
export class TransactionService {
  /** Base endpoint for transaction-related API calls */
  private apiUrl = 'http://localhost:3000/api/transactions';

  /**
   * @param http - Angular's HttpClient for performing HTTP requests
   */
  constructor(private http: HttpClient) { }

  /**
   * Retrieves transactions for the current user.
   * If no userId is stored, returns an empty array observable.
   * @returns Observable of transaction array
   */
  getTransactions(): Observable<any[]> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // No user ID => return empty list
      return of([]);
    }
    // Append userId as query parameter
    const urlWithUserId = `${this.apiUrl}?userId=${userId}`;
    return this.http.get<any[]>(urlWithUserId);
  }

  /**
   * Creates a new transaction record on the server.
   * @param transaction - object containing transaction details
   * @returns Observable of the created transaction
   */
  createTransaction(transaction: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, transaction);
  }

  /**
   * Updates an existing transaction by ID.
   * @param id - identifier of the transaction to update
   * @param transaction - object containing updated fields
   * @returns Observable of the updated transaction
   */
  updateTransaction(id: string, transaction: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, transaction);
  }

  /**
   * Retrieves a summary (income, expenses, balance) for the current user.
   * Returns zeros if no userId is available.
   * @returns Observable with summary object
   */
  getSummary(): Observable<any> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // Default summary when no user is logged in
      return of({ income: 0, expenses: 0, balance: 0 });
    }
    // Call summary endpoint with user filter
    return this.http.get<any>(`${this.apiUrl}/summary?userId=${userId}`);
  }

  /**
   * Deletes a transaction for the current user by ID.
   * Appends userId to ensure scoped deletion.
   * @param id - identifier of the transaction to delete
   * @returns Observable of the server response
   */
  deleteTransaction(id: string): Observable<any> {
    const userId = localStorage.getItem('userId');
    // Include userId in query for security/authorization
    return this.http.delete(`${this.apiUrl}/${id}?userId=${userId}`);
  }
}
