import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!authService.isAuthenticated()) return router.createUrlTree(['/login']);
  if (authService.requiresFirstLoginCompletion()) return router.createUrlTree(['/first-login']);
  if (!requiredRoles?.length) return true;

  const role = authService.getRole()?.toLowerCase();
  const allowed = requiredRoles.map((x) => x.toLowerCase());
  return role && allowed.includes(role) ? true : router.createUrlTree(['/access-denied']);
};
