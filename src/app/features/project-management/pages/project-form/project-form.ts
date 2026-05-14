import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { FormShellComponent } from '../../../../shared/ui/form-shell/form-shell';
import { FormSectionComponent } from '../../../../shared/ui/form-section/form-section';
import { ProjectManagementService } from '../../services/project-management.service';
import { ProjectStatus } from '../../models/project.model';
import { ClientManagementService } from '../../../client-management/services/client-management.service';
import { UserManagementService } from '../../../user-management/services/user-management';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    TextareaModule,
    FormShellComponent,
    FormSectionComponent
  ],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss'
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectManagementService);
  private readonly clientService = inject(ClientManagementService);
  private readonly userService = inject(UserManagementService);

  @Input() projectIdInput: string | null = null;
  @Input() inDialog = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;
  error = '';
  projectId: string | null = null;

  readonly statusOptions: Array<{ label: string; value: ProjectStatus }> = [
    { label: 'Planning', value: 'Planning' },
    { label: 'In Progress', value: 'InProgress' },
    { label: 'On Hold', value: 'OnHold' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  clientOptions: Array<{ label: string; value: string }> = [];
  engineerOptions: Array<{ label: string; value: string }> = [];

  form = this.fb.group({
    projectName: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    clientId: ['', Validators.required],
    startDate: [''],
    endDate: [''],
    budget: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    spentAmount: this.fb.nonNullable.control(0, [Validators.min(0)]),
    progressPercentage: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0), Validators.max(100)]),
    status: this.fb.nonNullable.control<ProjectStatus>('Planning', Validators.required),
    assignedEngineerId: ['']
  });

  ngOnInit(): void {
    this.projectId = this.projectIdInput;

    this.clientService.getAll({}).subscribe({
      next: (res) => {
        this.clientOptions = (res.data ?? []).map((c) => ({ label: c.name, value: c.id }));
      }
    });

    this.userService.getAll({ role: 'Engineer' }).subscribe({
      next: (res) => {
        this.engineerOptions = (res.data ?? []).map((u) => ({ label: u.fullName, value: u.id }));
      }
    });

    if (!this.projectId) return;

    this.loading = true;
    this.projectService.getById(this.projectId).subscribe({
      next: (res) => {
        const p = res.data;
        this.form.patchValue({
          projectName: p.projectName,
          description: p.description ?? '',
          clientId: p.clientId,
          startDate: p.startDate ? p.startDate.substring(0, 10) : '',
          endDate: p.endDate ? p.endDate.substring(0, 10) : '',
          budget: p.budget,
          spentAmount: p.spentAmount,
          progressPercentage: p.progressPercentage,
          status: p.status,
          assignedEngineerId: p.assignedEngineerId ?? ''
        });
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load project.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const base = {
      projectName: (v.projectName || '').trim(),
      description: (v.description || '').trim() || undefined,
      clientId: v.clientId || '',
      startDate: v.startDate || undefined,
      endDate: v.endDate || undefined,
      budget: Number(v.budget || 0),
      progressPercentage: Number(v.progressPercentage || 0),
      status: v.status as ProjectStatus,
      assignedEngineerId: v.assignedEngineerId || undefined
    };

    this.error = '';

    if (!this.projectId) {
      this.projectService.create(base).subscribe({
        next: () => this.saved.emit(),
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.message || 'Failed to create project.';
        }
      });
      return;
    }

    this.projectService.update(this.projectId, {
      ...base,
      spentAmount: Number(v.spentAmount || 0)
    }).subscribe({
      next: () => this.saved.emit(),
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to update project.';
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
