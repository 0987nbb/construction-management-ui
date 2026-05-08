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
}

interface JwtPayload {
  exp?: number;
  role?: string;
  ['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?: string;
}

@Injectable({
  providedIn: 'root'
})
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

  saveSession(result: AuthResult): void {
    if (!result.token) {
      return;
    }

    localStorage.setItem(this.tokenStorageKey, result.token);

    const tokenRole = this.getRoleFromToken(result.token);
    const effectiveRole = tokenRole ?? result.role;
    if (effectiveRole) {
      localStorage.setItem(this.roleStorageKey, effectiveRole);
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.roleStorageKey);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenStorageKey);
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return null;
    }

    return token;
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      const tokenRole = this.getRoleFromToken(token);
      if (tokenRole) {
        return tokenRole;
      }
    }

    return localStorage.getItem(this.roleStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getRoleFromToken(token: string): string | null {
    const payload = this.decodePayload(token);
    return (
      payload?.role ??
      payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      null
    );
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodePayload(token);
    if (!payload?.exp) {
      return true;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
  }

  private decodePayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payload = atob(padded);
      return JSON.parse(payload) as JwtPayload;
    } catch {
      return null;
    }
  }
}
