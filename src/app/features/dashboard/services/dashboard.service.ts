import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DashboardKpis {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminCount: number;
  projectManagerCount: number;
  engineerCount: number;
  accountantCount: number;
  clientCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/dashboard`;

  getKpis(): Observable<ApiResponse<DashboardKpis>> {
    return this.http.get<ApiResponse<DashboardKpis>>(`${this.apiUrl}/kpis`);
  }
}
