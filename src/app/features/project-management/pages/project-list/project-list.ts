import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProjectManagementService } from '../../services/project-management.service';
import { Project, ProjectFinancial, ProjectStatus, ApiResponse } from '../../models/project.model';
import { ProjectFormComponent } from '../project-form/project-form';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ProgressBarModule,
    DialogModule,
    ProjectFormComponent,
    CurrencyPipe
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss'
})
export class ProjectListComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectManagementService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  projects: Project[] = [];
  loading = false;
  error = '';
  search = '';
  showFormDialog = false;
  editingProjectId: string | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly role = signal<string | null>(this.authService.getRole());
  readonly canManage = computed(() => this.role() === 'Admin' || this.role() === 'Project Manager');

  ngOnInit(): void {
    this.search$.pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => this.load());
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    if (this.role() === 'Accountant') {
      this.projectService.getFinancial({ search: this.search }).subscribe({
        next: (res: ApiResponse<ProjectFinancial[]>) => {
          this.projects = (res.data ?? []).map((x) => ({
            id: x.id,
            projectName: x.projectName,
            clientId: '',
            clientName: x.clientName,
            budget: x.budget,
            spentAmount: x.spentAmount,
            progressPercentage: 0,
            status: x.status as ProjectStatus,
            createdAt: ''
          })) as Project[];
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.message || 'Failed to load projects.';
          this.loading = false;
        }
      });
      return;
    }

    this.projectService.getAll({ search: this.search }).subscribe({
      next: (res: ApiResponse<Project[]>) => {
        this.projects = res.data ?? [];
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load projects.';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.search$.next(this.search.trim());
  }

  clearSearch(): void {
    this.search = '';
    this.load();
  }

  openCreateDialog(): void {
    this.editingProjectId = null;
    this.showFormDialog = true;
  }

  openEditDialog(project: Project): void {
    this.editingProjectId = project.id;
    this.showFormDialog = true;
  }

  closeFormDialog(): void {
    this.showFormDialog = false;
    this.editingProjectId = null;
  }

  handleFormSaved(): void {
    this.closeFormDialog();
    this.load();
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Project saved successfully.' });
  }

  openDetails(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  remove(project: Project): void {
    this.confirmationService.confirm({
      header: 'Delete Project',
      message: `Delete ${project.projectName}? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.projectService.remove(project.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Project Deleted', detail: `${project.projectName} removed.` });
            this.load();
          },
          error: (err: HttpErrorResponse) => {
            this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: err.error?.message || 'Could not delete project.' });
          }
        });
      }
    });
  }

  statusSeverity(status: ProjectStatus): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    if (status === 'Completed') return 'success';
    if (status === 'InProgress') return 'info';
    if (status === 'OnHold') return 'warn';
    if (status === 'Cancelled') return 'danger';
    return 'secondary';
  }
}
