import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { SiteManagementService } from '../../services/site-management.service';
import { Site, SiteStatus } from '../../models/site.model';
import { UserManagementService } from '../../../user-management/services/user-management';
import { MessageService } from 'primeng/api';
import { RolePermissionsService } from '../../../../core/services/role-permissions.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-site-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TagModule, SelectModule, ButtonModule, InputNumberModule, ProgressBarModule, DatePipe],
  templateUrl: './site-details.html',
  styleUrl: './site-details.scss'
})
export class SiteDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly siteService = inject(SiteManagementService);
  private readonly userService = inject(UserManagementService);
  private readonly permissions = inject(RolePermissionsService);
  private readonly messageService = inject(MessageService);

  site: Site | null = null;
  loading = false;
  error = '';
  statusDraft: SiteStatus = 'Pending';
  progressDraft = 0;
  engineerDraft = '';

  readonly canManage = computed(() => this.permissions.canManageSites());
  readonly canAssignEngineer = computed(() => this.permissions.canAssignSiteEngineer());
  readonly canUpdateExecution = computed(() => this.permissions.canUpdateSiteStatus());

  readonly statusOptions: Array<{ label: string; value: SiteStatus }> = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Active', value: 'Active' },
    { label: 'On Hold', value: 'OnHold' },
    { label: 'Completed', value: 'Completed' }
  ];

  engineerOptions: Array<{ label: string; value: string }> = [];
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.canAssignEngineer()) {
      this.userService.getAll({ role: 'Engineer' }).subscribe({
        next: (res) => {
          this.engineerOptions = (res.data ?? []).map((u) => ({ label: u.fullName, value: u.id }));
        }
      });
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadSite(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSite(id: string): void {
    this.loading = true;
    this.error = '';
    this.siteService.getById(id).subscribe({
      next: (res) => {
        this.site = res.data;
        this.statusDraft = res.data.status;
        this.progressDraft = res.data.progressPercentage ?? 0;
        this.engineerDraft = res.data.assignedEngineerId ?? '';
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load site details.';
        this.loading = false;
      }
    });
  }

  saveStatus(): void {
    if (!this.site) return;
    this.siteService.updateStatus(this.site.id, this.statusDraft).subscribe({
      next: (res) => {
        this.site = res.data;
        this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: res.message });
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err.error?.message || 'Could not update status.' });
      }
    });
  }

  saveProgress(): void {
    if (!this.site) return;
    this.siteService.updateProgress(this.site.id, this.progressDraft).subscribe({
      next: (res) => {
        this.site = res.data;
        this.messageService.add({ severity: 'success', summary: 'Progress Updated', detail: res.message });
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err.error?.message || 'Could not update progress.' });
      }
    });
  }

  saveEngineer(): void {
    if (!this.site) return;
    this.siteService.assignEngineer(this.site.id, this.engineerDraft || null).subscribe({
      next: (res) => {
        this.site = res.data;
        this.engineerDraft = res.data.assignedEngineerId ?? '';
        this.messageService.add({ severity: 'success', summary: 'Engineer Assigned', detail: res.message });
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({ severity: 'error', summary: 'Assignment Failed', detail: err.error?.message || 'Could not assign engineer.' });
      }
    });
  }

  statusSeverity(status: SiteStatus): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    if (status === 'Completed') return 'success';
    if (status === 'Active') return 'info';
    if (status === 'OnHold') return 'warn';
    return 'secondary';
  }

  mapsUrl(site: Site): string | null {
    if (site.latitude != null && site.longitude != null) {
      return `https://www.google.com/maps?q=${site.latitude},${site.longitude}`;
    }
    return null;
  }
}
