import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthResult, AuthService } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginData = { email: '', password: '' };

  login(): void {
    this.authService.login(this.loginData).subscribe({
      next: (res: AuthResult) => {
        if (!res.token) return alert(res.message || 'Login failed');
        this.authService.saveSession(res);
        if (res.isFirstLogin) {
          this.router.navigateByUrl('/first-login');
          return;
        }
        this.router.navigateByUrl(this.authService.getLandingRouteByRole());
      },
      error: (err: HttpErrorResponse) => {
        const message = (err.error && err.error.message) || (typeof err.error === 'string' ? err.error : '') || 'Login failed';
        alert(message);
      }
    });
  }
}
