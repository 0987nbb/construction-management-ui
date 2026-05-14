import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
  role?: string;
  expiresAtUtc?: string;
  isFirstLogin?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface JwtPayload {
  exp?: number;
  role?: string;
  ['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenStorageKey = 'auth_token';
  private readonly roleStorageKey = 'auth_role';

  register(data: { fullName: string; email: string; password: string }): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.apiUrl}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.apiUrl}/login`, data);
  }

  setPassword(data: { token: string; password: string }): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.apiUrl}/set-password`, data);
  }

  validateSetupToken(token: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/validate-setup-token`, { params: { token } });
  }

  completeFirstLogin(payload: {
    currentPassword: string;
    newPassword: string;
    fullName: string;
    phoneNumber: string;
  }): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.apiUrl}/complete-first-login`, payload);
  }

  saveSession(result: AuthResult): void {
    if (!result.token) return;
    localStorage.setItem(this.tokenStorageKey, result.token);
    const role = this.getRoleFromToken(result.token) ?? result.role;
    if (role) localStorage.setItem(this.roleStorageKey, role);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.roleStorageKey);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenStorageKey);
    if (!token) return null;
    if (this.isTokenExpired(token)) {
      this.clearSession();
      return null;
    }
    return token;
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      const role = this.getRoleFromToken(token);
      if (role) return role;
    }
    return localStorage.getItem(this.roleStorageKey);
  }

  getLandingRouteByRole(): string {
    const role = this.getRole();
    switch (role) {
      case 'Admin':
        return '/dashboard';
      case 'Project Manager':
        return '/pm/dashboard';
      case 'Engineer':
        return '/engineer/dashboard';
      case 'Accountant':
        return '/accountant/dashboard';
      case 'Client':
        return '/client/dashboard';
      default:
        return '/access-denied';
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  showMainChrome(): boolean {
    return this.isAuthenticated();
  }

  private getRoleFromToken(token: string): string | null {
    const payload = this.decodePayload(token);
    return payload?.role ?? payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null;
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodePayload(token);
    if (!payload?.exp) return true;
    return payload.exp <= Math.floor(Date.now() / 1000);
  }

  private decodePayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
