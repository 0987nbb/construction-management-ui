import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAuthEndpoint = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

  const token = authService.getToken();
  const request = !isAuthEndpoint && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.clearSession();
        router.navigateByUrl('/login');
      }
      if (error.status === 403) {
        if (authService.requiresFirstLoginCompletion()) {
          router.navigateByUrl('/first-login');
        } else {
          router.navigateByUrl('/access-denied');
        }
      }
      return throwError(() => error);
    })
  );
};
