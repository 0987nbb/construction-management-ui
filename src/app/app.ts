import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from './features/auth/services/auth';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly role = computed(() => this.authService.getRole());
  readonly sidebarOpen = signal(false);

  readonly menu = computed(() => {
    const role = this.role();
    const common = [{ label: 'Profile', route: '/profile', icon: 'pi pi-user' }];

    if (role === 'Admin') {
      return [
        { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home' },
        { label: 'Users', route: '/users', icon: 'pi pi-users' },
        { label: 'Clients', route: '/clients', icon: 'pi pi-briefcase' },
        ...common
      ];
    }

    if (role === 'Project Manager') return [{ label: 'Manager Dashboard', route: '/pm/dashboard', icon: 'pi pi-chart-line' }, ...common];
    if (role === 'Engineer') return [{ label: 'Engineer Dashboard', route: '/engineer/dashboard', icon: 'pi pi-cog' }, ...common];
    if (role === 'Accountant') return [{ label: 'Finance Dashboard', route: '/accountant/dashboard', icon: 'pi pi-wallet' }, ...common];
    if (role === 'Client') return [{ label: 'Client Dashboard', route: '/client/dashboard', icon: 'pi pi-building' }, ...common];

    return [];
  });

  get showMainChrome(): boolean {
    return this.authService.showMainChrome();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authService.clearSession();
    this.closeSidebar();
    this.router.navigateByUrl('/login');
  }
}
