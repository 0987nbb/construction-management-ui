import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthResult, AuthService } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterLink  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  private authService = inject(AuthService);

  loginData = {
    email: '',
    password: ''
  };

  login() {

    this.authService.login(this.loginData)
      .subscribe({
        next: (res: AuthResult) => {
          console.log(res);

          if (res.token) {
            localStorage.setItem('token', res.token);
          }
          alert(res.message || 'Login Successful');
        },

        error: (err: HttpErrorResponse) => {
          console.log(err);
          const message =
            (err.error && err.error.message) ||
            (typeof err.error === 'string' ? err.error : '') ||
            'Login Failed';
          alert(message);
        }
      });
  }
}