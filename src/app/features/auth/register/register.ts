import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
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
        next: (res) => {

          console.log(res);

          alert('User Registered');
        },

        error: (err) => {

          console.log(err);

          alert('Registration Failed');
        }
      });
  }
}