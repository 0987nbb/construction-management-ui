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
import { SiteManagementService } from '../../services/site-management.service';
import { SiteStatus } from '../../models/site.model';
import { ProjectManagementService } from '../../../project-management/services/project-management.service';
import { UserManagementService } from '../../../user-management/services/user-management';

@Component({
  selector: 'app-site-form',
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
  templateUrl: './site-form.html',
  styleUrl: './site-form.scss'
})
export class SiteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly siteService = inject(SiteManagementService);
  private readonly projectService = inject(ProjectManagementService);
  private readonly userService = inject(UserManagementService);

  @Input() siteIdInput: string | null = null;
  @Input() inDialog = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;
  error = '';
  siteId: string | null = null;

  readonly statusOptions: Array<{ label: string; value: SiteStatus }> = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Active', value: 'Active' },
    { label: 'On Hold', value: 'OnHold' },
    { label: 'Completed', value: 'Completed' }
  ];

  projectOptions: Array<{ label: string; value: string }> = [];
  engineerOptions: Array<{ label: string; value: string }> = [];

  form = this.fb.group({
    siteName: ['', [Validators.required, Validators.minLength(2)]],
    projectId: ['', Validators.required],
    location: ['', [Validators.required, Validators.minLength(3)]],
    latitude: this.fb.control<number | null>(null),
    longitude: this.fb.control<number | null>(null),
    assignedEngineerId: [''],
    status: this.fb.nonNullable.control<SiteStatus>('Pending', Validators.required),
    progressPercentage: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(100)]),
    startDate: [''],
    endDate: [''],
    description: ['']
  });

  ngOnInit(): void {
    this.siteId = this.siteIdInput;

    this.projectService.getAll({}).subscribe({
      next: (res) => {
        this.projectOptions = (res.data ?? []).map((p) => ({ label: p.projectName, value: p.id }));
      }
    });

    this.userService.getAll({ role: 'Engineer' }).subscribe({
      next: (res) => {
        this.engineerOptions = (res.data ?? []).map((u) => ({ label: u.fullName, value: u.id }));
      }
    });

    if (!this.siteId) return;

    this.loading = true;
    this.siteService.getById(this.siteId).subscribe({
      next: (res) => {
        const s = res.data;
        this.form.patchValue({
          siteName: s.siteName,
          projectId: s.projectId,
          location: s.location,
          latitude: s.latitude ?? null,
          longitude: s.longitude ?? null,
          assignedEngineerId: s.assignedEngineerId ?? '',
          status: s.status,
          progressPercentage: s.progressPercentage ?? 0,
          startDate: s.startDate ? s.startDate.substring(0, 10) : '',
          endDate: s.endDate ? s.endDate.substring(0, 10) : '',
          description: s.description ?? ''
        });
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load site.';
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
    const payload = {
      siteName: (v.siteName || '').trim(),
      projectId: v.projectId || '',
      location: (v.location || '').trim(),
      latitude: v.latitude ?? null,
      longitude: v.longitude ?? null,
      assignedEngineerId: v.assignedEngineerId || undefined,
      status: v.status as SiteStatus,
      progressPercentage: Number(v.progressPercentage ?? 0),
      startDate: v.startDate || undefined,
      endDate: v.endDate || undefined,
      description: (v.description || '').trim() || undefined
    };

    this.error = '';

    if (!this.siteId) {
      this.siteService.create(payload).subscribe({
        next: () => this.saved.emit(),
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.message || 'Failed to create site.';
        }
      });
      return;
    }

    this.siteService.update(this.siteId, payload).subscribe({
      next: () => this.saved.emit(),
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to update site.';
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
