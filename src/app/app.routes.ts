import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'loginm',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component')
            .then(c => c.LoginComponent)
    }
    ,
    {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(c => c.RegisterComponent)
    }
];
