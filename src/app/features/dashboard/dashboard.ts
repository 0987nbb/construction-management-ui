import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/services/auth';
import { DashboardKpis, DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly role = this.authService.getRole() ?? 'User';
  loading = true;
  error = '';
  kpis: DashboardKpis = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminCount: 0,
    projectManagerCount: 0,
    engineerCount: 0,
    accountantCount: 0,
    clientCount: 0
  };

  ngOnInit(): void {
    if (this.role !== 'Admin') {
      this.loading = false;
      return;
    }

    this.dashboardService.getKpis().subscribe({
      next: (res) => {
        this.kpis = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dashboard KPIs.';
        this.loading = false;
      }
    });
  }
}
