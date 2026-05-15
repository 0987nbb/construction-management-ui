import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClientManagementService } from '../../services/client-management.service';
import { Client } from '../../models/client.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ClientFormComponent } from '../client-form/client-form';
import { RolePermissionsService } from '../../../../core/services/role-permissions.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, DialogModule, ClientFormComponent],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss'
})
export class ClientListComponent implements OnInit, OnDestroy {
  private readonly clientService = inject(ClientManagementService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly permissions = inject(RolePermissionsService);

  clients: Client[] = [];
  loading = false;
  error = '';

  search = '';
  showFormDialog = false;
  editingClientId: string | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  get canManageClients(): boolean {
    return this.permissions.canManageClients();
  }

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.load());
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.clientService.getAll({ search: this.search }).subscribe({
      next: (res) => {
        this.clients = res.data ?? [];
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load clients.';
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
    if (!this.canManageClients) return;
    this.editingClientId = null;
    this.showFormDialog = true;
  }

  openEditDialog(client: Client): void {
    if (!this.canManageClients) return;
    this.editingClientId = client.id;
    this.showFormDialog = true;
  }

  closeFormDialog(): void {
    this.showFormDialog = false;
    this.editingClientId = null;
  }

  handleFormSaved(): void {
    this.closeFormDialog();
    this.load();
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Client saved successfully.' });
  }

  delete(client: Client): void {
    if (!this.canManageClients) return;
    this.confirmationService.confirm({
      header: 'Delete Client',
      message: `Delete client ${client.name}? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.clientService.remove(client.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Client Deleted', detail: `${client.name} removed.` });
            this.load();
          },
          error: (err: HttpErrorResponse) => {
            this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: err.error?.message || 'Could not delete client.' });
          }
        });
      }
    });
  }
}
