import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';  

/**
 * LoginComponent handles user authentication via a modal form.
 * It emits events to close the modal or navigate to registration.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule       // Enables reactive form directives and validation
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  /**
   * Event emitter to signal that the login modal should close on success.
   */
  @Output() closeModal = new EventEmitter<void>();

  /**
   * Event emitter to switch to the registration form instead.
   */
  @Output() goToRegister = new EventEmitter<void>();

  /**
   * Input flag to control closing animation/state.
   */
  @Input() isClosing: boolean = false;

  // Reactive form group for email and password fields
  loginForm!: FormGroup;
  // Indicates whether a login request is in progress
  isLoading = false;
  // Stores any error message to display in the template
  errorMessage = '';

  /**
   * @param fb       - FormBuilder to construct the reactive form
   * @param authService - Service to call login API
   * @param router   - Router to navigate on successful login
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Initializes the FormGroup with validation rules on component load.
   */
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // email must be valid
      password: ['', [Validators.required]],                // password required
    });
  }

  /**
   * Handles form submission:
   * - Validates fields
   * - Shows loading spinner
   * - Calls AuthService.login()
   * - Emits closeModal and navigates on success
   * - Displays friendly error messages on failure
   */
  onSubmit(): void {
    // Mark all fields touched to trigger validation UI
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;  // Stop if form is invalid
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(credentials).pipe(
      finalize(() => this.isLoading = false)  // Hide spinner when done
    ).subscribe({
      next: (response) => {
        console.log('Login successful!', response);
        this.closeModal.emit();                // Signal to close modal
        this.router.navigate(['/dashboard']);   // Navigate to dashboard
      },
      error: (err: HttpErrorResponse) => {
        console.error('Login failed:', err);
        this.errorMessage = this.getFriendlyErrorMessage(err);  // Show error message
      }
    });
  }

  /**
   * Emits event to switch to the registration form
   */
  switchToRegister(): void {
    this.goToRegister.emit();
  }

  /**
   * Maps HTTP error codes/messages to user-friendly strings
   * @param error - the raw HttpErrorResponse from the server
   * @returns a readable error message for the UI
   */
  private getFriendlyErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;  // Use server-provided message if available
    }
    switch (error.status) {
      case 401:
      case 404:
        return 'Invalid email or password. Please try again.';
      default:
        return 'An unexpected server error occurred. Please try again later.';
    }
  }
}