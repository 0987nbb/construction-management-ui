import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterLink  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
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
        next: (res: any) => {

          console.log(res);

          localStorage.setItem('token', res);

          alert('Login Successful');
        },

        error: (err) => {
          console.log(err);
          alert('Login Failed');
        }
      });
  }
}