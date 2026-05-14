import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ClientManagementService } from '../../services/client-management.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TableModule, ButtonModule, InputTextModule, SelectModule, TagModule],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss'
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientManagementService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  clients: Client[] = [];
  loading = false;
  error = '';

  search = '';
  isActive: '' | 'true' | 'false' = '';

  readonly statusOptions: SelectItem[] = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' }
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.clientService.getAll({ search: this.search, isActive: this.isActive }).subscribe({
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

  clearFilters(): void {
    this.search = '';
    this.isActive = '';
    this.load();
  }

  delete(client: Client): void {
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
