import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Base URL for AI suggestion API endpoints
const AUTH_API_URL = 'http://localhost:3000/api/suggestions';

/**
 * Service responsible for communicating with the backend AI suggestions API.
 * Provides methods to generate new suggestions and retrieve suggestion history.
 */
@Injectable({
  providedIn: 'root' // Available application-wide
})
export class AiService {
  /**
   * API URL used for all suggestion-related endpoints
   */
  private apiUrl = `${AUTH_API_URL}`;

  /**
   * Inject HttpClient for making HTTP requests.
   * @param http - Angular HTTP client
   */
  constructor(private http: HttpClient) { }

  /**
   * Sends a prompt to the AI backend to generate a new suggestion.
   * @param prompt - The user or system-generated prompt string
   * @param userId - ID of the current user, used for associating responses
   * @returns Observable emitting the saved suggestion object
   */
  generateSuggestion(prompt: string, userId: string): Observable<any> {
    const payload = { prompt, userId };
    return this.http.post<any>(`${this.apiUrl}/generate`, payload);
  }

  /**
   * Retrieves the history of AI suggestions for a given user.
   * @param userId - ID of the current user
   * @returns Observable emitting an array of suggestion records
   */
  getSuggestionHistory(userId: string): Observable<any[]> {
    // Append userId as query parameter to filter history
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }
}
