import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';

/** Allows access only while the user still needs onboarding (temporary password → own password + profile). */
export const firstLoginPageGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) return router.createUrlTree(['/login']);
  if (!authService.requiresFirstLoginCompletion())
    return router.createUrlTree([authService.getLandingRouteByRole()]);
  return true;
};
