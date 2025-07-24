import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service'; // Service for user authentication and registration

/**
 * Validator function to ensure password and confirmPassword fields match.
 * @param control - the form group containing both password controls
 * @returns ValidationErrors|null indicating mismatch
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
    // Don't validate if one of the fields is empty
    return null;
  }
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

/**
 * Component handling user registration flow.
 * Implements reactive form with validation and emits events to
 * switch modals or handle navigation on success.
 */
@Component({
  selector   : 'app-register',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  /**
   * Emits event to close this registration modal on success.
   */
  @Output() closeModal = new EventEmitter<void>();
  /**
   * Emits event to switch back to the login modal.
   */
  @Output() goToLogin = new EventEmitter<void>();
  /**
   * Input flag to control closing animation/state.
   */
  @Input() isClosing: boolean = false;

  // Reactive form group containing name, email, password, confirmPassword
  registerForm!: FormGroup;
  // Tracks whether registration is in progress
  isLoading = false;
  // Holds any server or validation error message
  errorMessage = '';

  /**
   * @param fb - FormBuilder to construct the registration form
   * @param authService - Service to call register API
   * @param router - Router to navigate on successful registration
   */
  constructor(
    private fb          : FormBuilder,
    private authService : AuthService,
    private router      : Router
  ) {}

  /**
   * Initializes the form with validators and cross-field password match.
   */
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name          : ['', [Validators.required]],                      // Required full name
      email         : ['', [Validators.required, Validators.email]],    // Valid email
      password      : ['', [Validators.required, Validators.minLength(6)]], // Min length
      confirmPassword: ['', [Validators.required]]                      // Required confirmation
    }, {
      validators: passwordMatchValidator // Custom validator to match passwords
    });
  }

  /**
   * Submits the registration form:
   * - Validates the form
   * - Shows loading state
   * - Sends data via AuthService
   * - Emits events or shows errorMessage based on response
   */
  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      // Do not proceed if form is invalid
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registrationData = {
      name    : this.registerForm.value.name,
      email   : this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(registrationData).pipe(
      finalize(() => this.isLoading = false) // Reset loading on complete
    ).subscribe({
      next: (response) => {
        console.log('Registration successful!', response);
        this.closeModal.emit();        // Close modal
        this.router.navigate(['/dashboard']); // Navigate to dashboard
      },
      error: (err: HttpErrorResponse) => {
        console.error('Registration failed:', err);
        this.errorMessage = this.getFriendlyErrorMessage(err); // User-friendly error
      }
    });
  }

  /**
   * Emits event to switch back to the login flow/modal.
   */
  switchToLogin(): void {
    this.goToLogin.emit();
  }

  /**
   * Converts HTTP error codes/messages to user-friendly strings.
   * @param error - the HTTP error response
   * @returns string to display in the form
   */
  private getFriendlyErrorMessage(error: HttpErrorResponse): string {
    // Use server-provided message if available
    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }
    // Fallback by status code
    switch (error.status) {
      case 409:
        return 'This email address is already registered.';
      case 400:
        return 'Invalid data provided. Please check the form and try again.';
      default:
        return 'An unexpected server error occurred. Please try again later.';
    }
  }
}
