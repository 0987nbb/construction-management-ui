import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;

  getAll(): Observable<ApiResponse<User[]>> { return this.http.get<ApiResponse<User[]>>(this.apiUrl); }
  getById(id: string): Observable<ApiResponse<User>> { return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`); }
  create(payload: { fullName: string; email: string; password: string; role: UserRole; phoneNumber?: string; isActive: boolean; }): Observable<ApiResponse<User>> { return this.http.post<ApiResponse<User>>(this.apiUrl, payload); }
  update(id: string, payload: { fullName: string; phoneNumber?: string; }): Observable<ApiResponse<User>> { return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, payload); }
  remove(id: string): Observable<ApiResponse<boolean>> { return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`); }
  updateStatus(id: string, isActive: boolean): Observable<ApiResponse<User>> { return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/status`, { isActive }); }
  assignRole(id: string, role: UserRole): Observable<ApiResponse<User>> { return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/role`, { role }); }
  getProfile(): Observable<ApiResponse<User>> { return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`); }
  updateProfile(payload: { fullName: string; phoneNumber?: string; }): Observable<ApiResponse<User>> { return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, payload); }
}
