import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, CreateStaffResponse, User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;

  getAll(filters?: { search?: string; role?: UserRole | ''; isActive?: '' | 'true' | 'false' }): Observable<ApiResponse<User[]>> {
    let params = new HttpParams();
    if (filters?.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters?.role) params = params.set('role', filters.role);
    if (filters?.isActive) params = params.set('isActive', filters.isActive);
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<User>> { return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`); }
  create(payload: {
    fullName: string;
    email: string;
    role: UserRole;
    phoneNumber?: string;
    isActive: boolean;
  }): Observable<ApiResponse<CreateStaffResponse>> {
    return this.http.post<ApiResponse<CreateStaffResponse>>(this.apiUrl, payload);
  }
  update(id: string, payload: { fullName: string; phoneNumber?: string; }): Observable<ApiResponse<User>> { return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, payload); }
  remove(id: string): Observable<ApiResponse<boolean>> { return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`); }
  updateStatus(id: string, isActive: boolean): Observable<ApiResponse<User>> { return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/status`, { isActive }); }
  assignRole(id: string, role: UserRole): Observable<ApiResponse<User>> { return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/role`, { role }); }
  getProfile(): Observable<ApiResponse<User>> { return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`); }
  updateProfile(payload: { fullName: string; phoneNumber?: string; }): Observable<ApiResponse<User>> { return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, payload); }
}
