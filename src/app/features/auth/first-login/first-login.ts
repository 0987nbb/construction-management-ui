import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-first-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './first-login.html',
  styleUrl: '../login/login.scss'
})
export class FirstLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(5)]]
  });

  error = '';

  submit(): void {
    this.error = '';
    const v = this.form.getRawValue();
    if (this.form.invalid) return;
    if (v.newPassword !== v.confirmPassword) {
      this.error = 'New password and confirmation do not match.';
      return;
    }

    this.authService
      .completeFirstLogin({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
        fullName: v.fullName,
        phoneNumber: v.phoneNumber
      })
      .subscribe({
        next: (res) => {
          if (!res.success || !res.token) {
            this.error = res.message || 'Unable to finish onboarding.';
            return;
          }
          this.authService.saveSession(res);
          this.router.navigateByUrl(this.authService.getLandingRouteByRole());
        },
        error: (err: HttpErrorResponse) => {
          this.error =
            (err.error?.message && String(err.error.message)) ||
            (typeof err.error === 'string' ? err.error : '') ||
            'Something went wrong.';
        }
      });
  }
}
