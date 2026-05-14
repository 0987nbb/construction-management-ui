import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './set-password.html',
  styleUrl: './set-password.scss'
})
export class SetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  message = '';
  error = '';
  tokenValidating = true;
  tokenIsValid = false;
  allowDirectSubmit = false;
  private token = '';

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error = 'Invalid invite link.';
      this.tokenValidating = false;
      return;
    }

    setTimeout(() => {
      if (this.tokenValidating) {
        this.tokenValidating = false;
        this.allowDirectSubmit = true;
        this.error = 'Link verification is taking too long. You can still continue and set password.';
      }
    }, 8000);

    this.authService.validateSetupToken(this.token).subscribe({
      next: () => {
        this.tokenIsValid = true;
        this.tokenValidating = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Invite link is invalid or expired.';
        this.tokenValidating = false;
      }
    });
  }

  submit(): void {
    this.error = '';
    if (!this.token) { this.error = 'Invite link is invalid or expired.'; return; }
    if (!this.tokenIsValid && !this.allowDirectSubmit) { this.error = 'Invite link is invalid or expired.'; return; }
    if (this.form.invalid) return;

    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) { this.error = 'Passwords do not match.'; return; }

    this.authService.setPassword({ token: this.token, password: password! }).subscribe({
      next: (res) => {
        this.message = res.message;
        setTimeout(() => this.router.navigateByUrl('/login'), 1200);
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Unable to set password.';
      }
    });
  }

  continueAnyway(): void {
    this.error = '';
    this.allowDirectSubmit = true;
    this.tokenValidating = false;
  }
}
