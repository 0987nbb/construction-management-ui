import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../auth-ui.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  submitting = false;
  error = '';

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
    confirmPassword: ['', [Validators.required]]
  });

  register(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.password !== value.confirmPassword) {
      this.error = 'Password and confirmation must match.';
      return;
    }

    this.submitting = true;
    this.authService.register({
      fullName: (value.fullName ?? '').trim(),
      email: (value.email ?? '').trim().toLowerCase(),
      password: value.password ?? ''
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigateByUrl('/login');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = this.resolveAuthError(err, 'Unable to register right now.');
      }
    });
  }

  private resolveAuthError(err: HttpErrorResponse, fallback: string): string {
    const apiMessage = err?.error?.message;
    if (apiMessage) return apiMessage;
    if (err.status === 0) return 'Network issue: unable to reach server.';
    if (err.status === 409) return 'This email is already registered.';
    return fallback;
  }
}
