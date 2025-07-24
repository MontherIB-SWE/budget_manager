import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../core/models/category.model';

/**
 * Service for managing categories via HTTP API calls.
 * Provides methods to fetch and create categories for the current user.
 */
@Injectable({
  providedIn: 'root'  // Singleton service available app-wide
})
export class CategoryService {
  /**
   * Base URL for category-related API endpoints
   */
  private apiUrl = 'http://localhost:3000/api/categories';

  /**
   * @param http - Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) { }

  /**
   * Retrieves the list of categories for a given user.
   * @param userId - ID of the user whose categories to fetch
   * @returns Observable emitting an array of Category objects
   */
  getCategories(userId: string): Observable<Category[]> {
    // Append userId as query parameter to filter categories
    return this.http.get<Category[]>(`${this.apiUrl}?userId=${userId}`);
  }

  /**
   * Creates a new category on the server.
   * @param category - Category object containing name and userId
   * @returns Observable emitting the created Category with its new ID
   */
  createCategory(category: Category): Observable<Category> {
    // Send a POST request with the category payload
    return this.http.post<Category>(this.apiUrl, category);
  }
}