import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SiteManagementService } from '../../services/site-management.service';
import { Site, SiteStatus, ApiResponse } from '../../models/site.model';
import { SiteFormComponent } from '../site-form/site-form';
import { RolePermissionsService } from '../../../../core/services/role-permissions.service';

@Component({
  selector: 'app-site-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    SiteFormComponent
  ],
  templateUrl: './site-list.html',
  styleUrl: './site-list.scss'
})
export class SiteListComponent implements OnInit, OnDestroy {
  private readonly siteService = inject(SiteManagementService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly permissions = inject(RolePermissionsService);
  private readonly router = inject(Router);

  sites: Site[] = [];
  loading = false;
  error = '';
  search = '';
  showFormDialog = false;
  editingSiteId: string | null = null;

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly canManage = computed(() => this.permissions.canManageSites());
  readonly canDelete = computed(() => this.permissions.canDeleteSites());
  readonly canUpdateExecution = computed(() => this.permissions.canUpdateSiteStatus());
  readonly isReadOnly = computed(() => this.permissions.isReadOnly());

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
    this.siteService.getAll({
      search: this.search
    }).subscribe({
      next: (res: ApiResponse<Site[]>) => {
        this.sites = res.data ?? [];
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load sites.';
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
    this.editingSiteId = null;
    this.showFormDialog = true;
  }

  openEditDialog(site: Site): void {
    this.editingSiteId = site.id;
    this.showFormDialog = true;
  }

  closeFormDialog(): void {
    this.showFormDialog = false;
    this.editingSiteId = null;
  }

  handleFormSaved(): void {
    this.closeFormDialog();
    this.load();
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Site saved successfully.' });
  }

  openDetails(site: Site): void {
    this.router.navigate(['/sites', site.id]);
  }

  remove(site: Site): void {
    this.confirmationService.confirm({
      header: 'Delete Site',
      message: `Delete ${site.siteName}? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.siteService.remove(site.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Site Deleted', detail: `${site.siteName} removed.` });
            this.load();
          },
          error: (err: HttpErrorResponse) => {
            this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: err.error?.message || 'Could not delete site.' });
          }
        });
      }
    });
  }

  statusSeverity(status: SiteStatus): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    if (status === 'Completed') return 'success';
    if (status === 'Active') return 'info';
    if (status === 'OnHold') return 'warn';
    return 'secondary';
  }

  locationLabel(site: Site): string {
    if (site.latitude != null && site.longitude != null) {
      return `${site.location} (${site.latitude}, ${site.longitude})`;
    }
    return site.location;
  }
}
