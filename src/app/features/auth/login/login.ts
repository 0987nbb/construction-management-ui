import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: '../auth-ui.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  submitting = false;
  error = '';

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required]]
  });

  constructor() {
    this.authService.clearSession();
  }

  login(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.getRawValue();
    this.authService.login({ email: payload.email ?? '', password: payload.password ?? '' }).subscribe({
      next: (res) => {
        this.submitting = false;
        if (!res.token) {
          this.error = res.message || 'Login failed';
          return;
        }

        this.authService.saveSession(res);
        this.router.navigateByUrl(this.authService.getLandingRouteByRole());
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Login failed';
      }
    });
  }
}
