import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isPublicAuthEndpoint =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/set-password') ||
    req.url.includes('/api/auth/validate-setup-token') ||
    req.url.includes('/api/auth/validate-reset-token') ||
    req.url.includes('/api/auth/request-password-reset') ||
    req.url.includes('/api/auth/reset-password');

  const token = authService.getToken();
  const request = !isPublicAuthEndpoint && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error) => {
      if (isPublicAuthEndpoint) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        authService.clearSession();
        router.navigateByUrl('/login');
      }
      if (error.status === 403) {
        router.navigateByUrl('/access-denied');
      }
      return throwError(() => error);
    })
  );
};
