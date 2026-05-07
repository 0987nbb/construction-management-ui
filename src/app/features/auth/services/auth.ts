import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7095/api/auth';

  register(data: { fullName: string; email: string; password: string }): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.apiUrl}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.apiUrl}/login`, data);
  }
}