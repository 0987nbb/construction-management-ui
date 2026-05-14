import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProjectManagementService } from '../../services/project-management.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterLink, TagModule, ProgressBarModule, CurrencyPipe, DatePipe],
  templateUrl: './project-details.html',
  styleUrl: './project-details.scss'
})
export class ProjectDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectManagementService);

  project: Project | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading = true;
    this.projectService.getById(id).subscribe({
      next: (res) => {
        this.project = res.data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load project details.';
        this.loading = false;
      }
    });
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    if (status === 'Completed') return 'success';
    if (status === 'InProgress') return 'info';
    if (status === 'OnHold') return 'warn';
    if (status === 'Cancelled') return 'danger';
    return 'secondary';
  }
}
