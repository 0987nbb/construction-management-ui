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

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
    confirmPassword: ['', [Validators.required]]
  });

  submit(): void {
    this.error = '';
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.error = 'Invalid invite link.'; return; }
    if (this.form.invalid) return;

    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) { this.error = 'Passwords do not match.'; return; }

    this.authService.setPassword({ token, password: password! }).subscribe({
      next: (res) => {
        this.message = res.message;
        setTimeout(() => this.router.navigateByUrl('/login'), 1200);
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Unable to set password.';
      }
    });
  }
}
