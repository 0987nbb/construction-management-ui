import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Site, SiteStatus } from '../models/site.model';

@Injectable({ providedIn: 'root' })
export class SiteManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/sites`;

  getAll(filters?: { search?: string; status?: SiteStatus | ''; projectId?: string | '' }): Observable<ApiResponse<Site[]>> {
    let params = new HttpParams();
    if (filters?.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.projectId) params = params.set('projectId', filters.projectId);
    return this.http.get<ApiResponse<Site[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Site>> {
    return this.http.get<ApiResponse<Site>>(`${this.apiUrl}/${id}`);
  }

  create(payload: {
    siteName: string;
    projectId: string;
    location: string;
    latitude?: number | null;
    longitude?: number | null;
    assignedEngineerId?: string;
    status: SiteStatus;
    progressPercentage?: number;
    startDate?: string;
    endDate?: string;
    description?: string;
  }): Observable<ApiResponse<Site>> {
    return this.http.post<ApiResponse<Site>>(this.apiUrl, payload);
  }

  update(id: string, payload: {
    siteName: string;
    projectId: string;
    location: string;
    latitude?: number | null;
    longitude?: number | null;
    assignedEngineerId?: string;
    status: SiteStatus;
    progressPercentage?: number;
    startDate?: string;
    endDate?: string;
    description?: string;
  }): Observable<ApiResponse<Site>> {
    return this.http.put<ApiResponse<Site>>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  assignEngineer(id: string, assignedEngineerId?: string | null): Observable<ApiResponse<Site>> {
    return this.http.patch<ApiResponse<Site>>(`${this.apiUrl}/${id}/assign-engineer`, { assignedEngineerId: assignedEngineerId || null });
  }

  updateStatus(id: string, status: SiteStatus): Observable<ApiResponse<Site>> {
    return this.http.patch<ApiResponse<Site>>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateProgress(id: string, progressPercentage: number): Observable<ApiResponse<Site>> {
    return this.http.patch<ApiResponse<Site>>(`${this.apiUrl}/${id}/progress`, { progressPercentage });
  }
}
