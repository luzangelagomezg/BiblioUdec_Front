import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const allowedRoles = route.data['roles'] as string[];

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Usuario no tiene permisos, redirigir a préstamos
    router.navigate(['/']);
    return false;
  }

  return true;
};
