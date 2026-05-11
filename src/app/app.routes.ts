import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((c) => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then((c) => c.RegisterComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.DashboardComponent) },

  { path: 'users', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/user-management/pages/user-list/user-list').then((c) => c.UserListComponent) },
  { path: 'users/new', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/user-management/pages/user-form/user-form').then((c) => c.UserFormComponent) },
  { path: 'users/:id/edit', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/user-management/pages/user-form/user-form').then((c) => c.UserFormComponent) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/user-management/pages/profile/profile').then((c) => c.ProfileComponent) },

  { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.DashboardComponent) },
  { path: '**', redirectTo: 'login' }
];
