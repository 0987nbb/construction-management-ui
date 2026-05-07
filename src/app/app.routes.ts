import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login')
            .then(c => c.LoginComponent)
    }
    ,
    {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register')
        .then(c => c.RegisterComponent)
    }
];
