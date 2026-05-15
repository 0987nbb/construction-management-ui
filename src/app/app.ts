import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from './features/auth/services/auth';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
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
  readonly displayName = computed(() => this.authService.getDisplayName());
  readonly welcomeTitle = computed(() => {
    const name = this.displayName();
    const role = this.role();
    if (name && role) return `Welcome, ${name} (${role})`;
    if (name) return `Welcome, ${name}`;
    return role ? `Welcome, ${role}` : 'Welcome';
  });
  readonly sidebarOpen = signal(false);

  readonly menu = computed(() => {
    const role = this.role();
    const common = [{ label: 'Profile', route: '/profile', icon: 'pi pi-user' }];

    if (role === 'Admin') {
      return [
        { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home' },
        { label: 'Users', route: '/users', icon: 'pi pi-users' },
        { label: 'Clients', route: '/clients', icon: 'pi pi-briefcase' },
        { label: 'Projects', route: '/projects', icon: 'pi pi-sitemap' },
        { label: 'Sites', route: '/sites', icon: 'pi pi-map-marker' },
        ...common
      ];
    }

    if (role === 'Project Manager') return [{ label: 'Manager Dashboard', route: '/pm/dashboard', icon: 'pi pi-chart-line' }, { label: 'Clients', route: '/clients', icon: 'pi pi-briefcase' }, { label: 'Projects', route: '/projects', icon: 'pi pi-sitemap' }, { label: 'Sites', route: '/sites', icon: 'pi pi-map-marker' }, ...common];
    if (role === 'Engineer') return [{ label: 'Engineer Dashboard', route: '/engineer/dashboard', icon: 'pi pi-cog' }, { label: 'Projects', route: '/projects', icon: 'pi pi-sitemap' }, { label: 'Sites', route: '/sites', icon: 'pi pi-map-marker' }, ...common];
    if (role === 'Accountant') return [{ label: 'Finance Dashboard', route: '/accountant/dashboard', icon: 'pi pi-wallet' }, { label: 'Projects', route: '/projects', icon: 'pi pi-sitemap' }, { label: 'Sites', route: '/sites', icon: 'pi pi-map-marker' }, ...common];
    if (role === 'Client') return [{ label: 'Client Dashboard', route: '/client/dashboard', icon: 'pi pi-building' }, { label: 'Projects', route: '/projects', icon: 'pi pi-sitemap' }, { label: 'Sites', route: '/sites', icon: 'pi pi-map-marker' }, ...common];

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

  navigate(route: string): void {
    void this.router.navigateByUrl(route);
    this.closeSidebar();
  }

  isMenuActive(route: string): boolean {
    if (route === '/dashboard' || route.endsWith('/dashboard')) {
      return this.router.url === route;
    }
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.clearSession();
    this.closeSidebar();
    this.router.navigateByUrl('/login');
  }
}
