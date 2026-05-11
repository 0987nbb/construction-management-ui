import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((c) => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then((c) => c.RegisterComponent) },
  { path: 'set-password', loadComponent: () => import('./features/auth/set-password/set-password').then((c) => c.SetPasswordComponent) },
  { path: 'access-denied', loadComponent: () => import('./features/access-denied/access-denied').then((c) => c.AccessDeniedComponent) },

  { path: 'dashboard', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.DashboardComponent) },
  { path: 'users', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/user-management/pages/user-list/user-list').then((c) => c.UserListComponent) },
  { path: 'users/new', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/user-management/pages/user-form/user-form').then((c) => c.UserFormComponent) },
  { path: 'users/:id/edit', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, loadComponent: () => import('./features/user-management/pages/user-form/user-form').then((c) => c.UserFormComponent) },

  { path: 'pm/dashboard', canActivate: [authGuard, roleGuard], data: { roles: ['Project Manager'] }, loadComponent: () => import('./features/role-dashboards/project-manager/project-manager-dashboard').then((c) => c.ProjectManagerDashboardComponent) },
  { path: 'engineer/dashboard', canActivate: [authGuard, roleGuard], data: { roles: ['Engineer'] }, loadComponent: () => import('./features/role-dashboards/engineer/engineer-dashboard').then((c) => c.EngineerDashboardComponent) },
  { path: 'accountant/dashboard', canActivate: [authGuard, roleGuard], data: { roles: ['Accountant'] }, loadComponent: () => import('./features/role-dashboards/accountant/accountant-dashboard').then((c) => c.AccountantDashboardComponent) },
  { path: 'client/dashboard', canActivate: [authGuard, roleGuard], data: { roles: ['Client'] }, loadComponent: () => import('./features/role-dashboards/client/client-dashboard').then((c) => c.ClientDashboardComponent) },

  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/user-management/pages/profile/profile').then((c) => c.ProfileComponent) },
  { path: '**', redirectTo: 'login' }
];
