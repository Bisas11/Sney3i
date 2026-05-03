import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const role = this.auth.currentUser?.role;
    const normalizedRole = role === 'prestataire' ? 'provider' : role;
    if (this.auth.isLoggedIn && normalizedRole === expectedRole) return true;
    this.router.navigate(['/']);
    return false;
  }
}
