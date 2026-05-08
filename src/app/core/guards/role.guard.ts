import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const normalizedRequiredRoles = requiredRoles.map((role) => role.toLowerCase());
  const userRole = authService.getRole()?.toLowerCase();

  if (userRole && normalizedRequiredRoles.includes(userRole)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
