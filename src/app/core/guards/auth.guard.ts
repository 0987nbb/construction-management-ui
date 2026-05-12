import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const path = state.url.split('?')[0] ?? '';
  if (
    authService.requiresFirstLoginCompletion() &&
    path !== '/first-login' &&
    !path.startsWith('/first-login/')
  ) {
    return router.createUrlTree(['/first-login']);
  }

  return true;
};
