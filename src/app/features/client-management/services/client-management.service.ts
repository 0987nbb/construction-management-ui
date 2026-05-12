import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/clients`;

  getAll(filters?: { search?: string; isActive?: '' | 'true' | 'false' }): Observable<ApiResponse<Client[]>> {
    let params = new HttpParams();
    if (filters?.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters?.isActive) params = params.set('isActive', filters.isActive);
    return this.http.get<ApiResponse<Client[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/${id}`);
  }

  create(payload: { name: string; email: string; phone: string; address: string; company: string; isActive: boolean }): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(this.apiUrl, payload);
  }

  update(id: string, payload: { name: string; email: string; phone: string; address: string; company: string; isActive: boolean }): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  linkProject(id: string, payload: { projectName: string; projectCode: string }): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(`${this.apiUrl}/${id}/projects`, payload);
  }
}
