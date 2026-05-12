import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientManagementService } from '../../services/client-management.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss'
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientManagementService);

  clients: Client[] = [];
  loading = false;
  error = '';

  search = '';
  isActive: '' | 'true' | 'false' = '';

  ngOnInit(): void { this.load(); }

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
    if (!confirm(`Delete client ${client.name}?`)) return;
    this.clientService.remove(client.id).subscribe({ next: () => this.load() });
  }
}
