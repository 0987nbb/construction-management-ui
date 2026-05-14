import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Project, ProjectFinancial, ProjectStatus } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/projects`;

  getAll(filters?: { search?: string; status?: ProjectStatus | ''; clientId?: string | '' }): Observable<ApiResponse<Project[]>> {
    let params = new HttpParams();
    if (filters?.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.clientId) params = params.set('clientId', filters.clientId);
    return this.http.get<ApiResponse<Project[]>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`);
  }

  getFinancial(filters?: { search?: string; status?: ProjectStatus | ''; clientId?: string | '' }): Observable<ApiResponse<ProjectFinancial[]>> {
    let params = new HttpParams();
    if (filters?.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.clientId) params = params.set('clientId', filters.clientId);
    return this.http.get<ApiResponse<ProjectFinancial[]>>(`${this.apiUrl}/financial`, { params });
  }

  create(payload: {
    projectName: string;
    description?: string;
    clientId: string;
    startDate?: string;
    endDate?: string;
    budget: number;
    progressPercentage: number;
    status: ProjectStatus;
    assignedEngineerId?: string;
  }): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.apiUrl, payload);
  }

  update(id: string, payload: {
    projectName: string;
    description?: string;
    clientId: string;
    startDate?: string;
    endDate?: string;
    budget: number;
    spentAmount: number;
    progressPercentage: number;
    status: ProjectStatus;
    assignedEngineerId?: string;
  }): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: ProjectStatus): Observable<ApiResponse<Project>> {
    return this.http.patch<ApiResponse<Project>>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateProgress(id: string, progressPercentage: number): Observable<ApiResponse<Project>> {
    return this.http.patch<ApiResponse<Project>>(`${this.apiUrl}/${id}/progress`, { progressPercentage });
  }
}
