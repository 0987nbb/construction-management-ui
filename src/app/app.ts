import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly role = computed(() => this.authService.getRole());

  readonly menu = computed(() => {
    const role = this.role();
    const common = [{ label: 'Profile', route: '/profile' }];
    if (role === 'Admin') return [{ label: 'Admin Dashboard', route: '/dashboard' }, { label: 'Users', route: '/users' }, { label: 'Clients', route: '/clients' }, ...common];
    if (role === 'Project Manager') return [{ label: 'PM Dashboard', route: '/pm/dashboard' }, ...common];
    if (role === 'Engineer') return [{ label: 'Engineer Dashboard', route: '/engineer/dashboard' }, ...common];
    if (role === 'Accountant') return [{ label: 'Finance Dashboard', route: '/accountant/dashboard' }, ...common];
    if (role === 'Client') return [{ label: 'Client Dashboard', route: '/client/dashboard' }, ...common];
    return [];
  });

  get showMainChrome(): boolean {
    return this.authService.showMainChrome();
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigateByUrl('/login');
  }
}
