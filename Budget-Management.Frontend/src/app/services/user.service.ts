import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Base URL for user-related API endpoints
const USER_API_URL = 'http://localhost:3000/api/users';

/**
 * Service for managing user data such as fetching current user details
 * and updating the user's average income. Also provides helper methods
 * for storing and retrieving the user ID in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   * @param http - Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Updates the average income for the specified user in the backend.
   * @param userId - ID of the user to update
   * @param averageIncome - new average income value to persist
   * @returns Observable emitting the server response
   */
  updateAverageIncome(userId: string, averageIncome: number): Observable<any> {
    const url = `${USER_API_URL}/${userId}/income`;
    return this.http.put<any>(url, { averageIncome });
  }

  /**
   * Retrieves the current user's details from the backend.
   * If no userId is stored locally, returns null wrapped in an Observable.
   * @returns Observable emitting the user object or null
   */
  getCurrentUser(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      // No logged-in user; return null
      return of(null);
    }
    // Fetch user details by ID
    return this.http.get<any>(`${USER_API_URL}/${userId}`);
  }

  /**
   * Stores the user ID in localStorage for session persistence.
   * @param id - the user ID string to save
   */
  saveUserId(id: string): void {
    localStorage.setItem('userId', id);
  }

  /**
   * Retrieves the stored user ID from localStorage, if any.
   * @returns the user ID string or null if not set
   */
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  /**
   * Fetches the current user's name from the backend.
   * Chains the getCurrentUser result to extract the `name` property.
   * @returns Observable emitting the user's name or null
   */
  getUserName(): Observable<string | null> {
    const userId = this.getUserId();
    if (!userId) {
      return of(null);
    }
    return this.http.get<any>(`${USER_API_URL}/${userId}`).pipe(
      // Map the user object to its `name` or null if absent
      switchMap(user => of(user?.name ?? null))
    );
  }
}