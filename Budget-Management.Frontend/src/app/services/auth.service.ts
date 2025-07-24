import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Base URL for authentication-related API endpoints
const AUTH_API_URL = 'http://localhost:3000/api/auth';

/**
 * Service responsible for user authentication flows (login and registration).
 * Stores the authenticated user's ID in localStorage for subsequent requests.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * @param http - Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Sends login credentials to the authentication API.
   * On successful response, extracts and saves the user ID.
   * @param credentials - object containing email and password
   * @returns Observable of the HTTP response
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${AUTH_API_URL}/login`, credentials).pipe(
      // Side effect: store user ID in localStorage on success
      tap(response => this.saveUserIdFromResponse(response))
    );
  }

  /**
   * Sends registration data to the authentication API.
   * On successful response, extracts and saves the user ID.
   * @param data - object containing name, email, password, and optional phone
   * @returns Observable of the HTTP response
   */
  register(data: { name: string; email: string; password: string; phone?: string }): Observable<any> {
    return this.http.post<any>(`${AUTH_API_URL}/register`, data).pipe(
      // Side effect: store user ID in localStorage on success
      tap(response => this.saveUserIdFromResponse(response))
    );
  }

  /**
   * Parses the HTTP response and saves the user ID to localStorage.
   * @param response - HTTP response object expected to contain response.user.id
   */
  private saveUserIdFromResponse(response: any): void {
    if (response && response.user && response.user.id) {
      localStorage.setItem('userId', response.user.id);
    }
  }
}
