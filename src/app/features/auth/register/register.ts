import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthResult, AuthService } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerData = {
    fullName: '',
    email: '',
    password: ''
  };

  register() {
    this.authService.register(this.registerData).subscribe({
      next: (res: AuthResult) => {
        alert(res.message || 'User registered successfully');
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        const message =
          (err.error && err.error.message) ||
          (typeof err.error === 'string' ? err.error : '') ||
          'Registration failed';
        alert(message);
      }
    });
  }
}
