import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthResult, AuthService } from '../services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  private authService = inject(AuthService);

  registerData = {
    fullName: '',
    email: '',
    password: ''
  };

  register() {

    this.authService.register(this.registerData)
      .subscribe({
        next: (res: AuthResult) => {
          console.log(res);
          alert(res.message || 'User Registered');
        },

        error: (err: HttpErrorResponse) => {
          console.log(err);
          const message =
            (err.error && err.error.message) ||
            (typeof err.error === 'string' ? err.error : '') ||
            'Registration Failed';
          alert(message);
        }
      });
  }
}