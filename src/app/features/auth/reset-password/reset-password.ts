import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, timeout } from 'rxjs';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: '../auth-ui.scss'
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly token = signal('');
  readonly checkingToken = signal(true);
  readonly tokenIsValid = signal(false);
  readonly allowDirectSubmit = signal(false);
  readonly submitting = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  readonly form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor() {
    const token = this.readTokenFromUrl();
    this.token.set(token);

    if (!token) {
      this.error.set('Reset token is missing. Open the full link from your email.');
      this.checkingToken.set(false);
      return;
    }

    // Show the form quickly if validation is slow or the API is unreachable.
    setTimeout(() => {
      if (this.checkingToken()) {
        this.checkingToken.set(false);
        this.allowDirectSubmit.set(true);
        this.error.set('Could not verify the link yet. You can still try to set your new password.');
      }
    }, 3000);

    this.authService.validateResetToken(token).pipe(
      timeout(10000),
      catchError((err) => {
        if (err?.name === 'TimeoutError') {
          return of({
            success: false,
            message: 'Unable to reach the server. Start the API (https://localhost:7095) and try again.',
            data: false
          });
        }

        if (err?.status === 0) {
          return of({
            success: false,
            message: 'Cannot connect to the API. Make sure the backend is running.',
            data: false
          });
        }

        if (err?.status === 404) {
          return of({
            success: false,
            message: 'Password reset validation is not available. Restart the API with the latest code.',
            data: false
          });
        }

        return of({
          success: false,
          message: err?.error?.message ?? 'Reset token is invalid or expired.',
          data: false
        });
      }),
      finalize(() => {
        this.checkingToken.set(false);
      })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.tokenIsValid.set(true);
          this.allowDirectSubmit.set(true);
          this.error.set('');
          return;
        }

        this.error.set(res.message || 'Reset token is invalid or expired.');
      }
    });
  }

  continueAnyway(): void {
    this.error.set('');
    this.allowDirectSubmit.set(true);
    this.checkingToken.set(false);
  }

  submit(): void {
    this.error.set('');
    this.message.set('');

    const token = this.token();
    if (!token) {
      this.error.set('Reset token is missing.');
      return;
    }

    if (!this.tokenIsValid() && !this.allowDirectSubmit()) {
      this.error.set('Reset token is invalid or expired.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.error.set('Password and confirmation must match.');
      return;
    }

    this.submitting.set(true);
    this.authService.resetPassword(token, value.newPassword ?? '').subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (!res.success) {
          this.error.set(res.message || 'Unable to reset password.');
          return;
        }

        this.message.set(res.message);
        setTimeout(() => this.router.navigateByUrl('/login'), 1200);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Unable to reset password.');
      }
    });
  }

  private readTokenFromUrl(): string {
    const fromRouter = this.route.snapshot.queryParamMap.get('token');
    if (fromRouter) {
      return fromRouter.trim();
    }

    const fromWindow = new URLSearchParams(window.location.search).get('token');
    return fromWindow?.replace(/ /g, '+').trim() ?? '';
  }
}
