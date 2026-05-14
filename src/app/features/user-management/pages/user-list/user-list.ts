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
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { UserManagementService } from '../../services/user-management';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TableModule, ButtonModule, InputTextModule, SelectModule, TagModule, TooltipModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserManagementService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  users: User[] = [];
  loading = false;
  error = '';

  search = '';
  role: UserRole | '' = '';
  isActive: '' | 'true' | 'false' = '';

  readonly roles: UserRole[] = ['Admin', 'Project Manager', 'Engineer', 'Accountant', 'Client'];
  readonly roleOptions: SelectItem[] = [{ label: 'All Roles', value: '' }, ...this.roles.map((r) => ({ label: r, value: r }))];
  readonly statusOptions: SelectItem[] = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' }
  ];

  ngOnInit(): void {
    this.load();
  }

  onboardingLabel(user: User): string {
    if (user.mustChangePassword) return 'Invite Pending';
    if (user.isFirstLogin) return 'First Login Pending';
    return 'Active';
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.userService.getAll({ search: this.search, role: this.role, isActive: this.isActive }).subscribe({
      next: (res) => {
        this.users = res.data ?? [];
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load users.';
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.search = '';
    this.role = '';
    this.isActive = '';
    this.load();
  }

  toggle(user: User): void {
    this.userService.updateStatus(user.id, !user.isActive).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `${user.fullName} is now ${!user.isActive ? 'Active' : 'Inactive'}.` });
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err.error?.message || 'Could not update user status.' });
      }
    });
  }

  resetPassword(user: User): void {
    const pwd = window.prompt(`Set temporary password for ${user.fullName} (min 8 chars):`);
    if (pwd == null || pwd.length < 8) return;

    this.userService.adminResetTemporaryPassword(user.id, pwd).subscribe({
      next: (res) => {
        const detail = res.data?.temporaryPassword ? `Temporary password: ${res.data.temporaryPassword}` : (res.message || 'Password reset.');
        this.messageService.add({ severity: 'success', summary: 'Password Reset', detail, life: 8000 });
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({ severity: 'error', summary: 'Reset Failed', detail: err.error?.message || 'Reset failed.' });
      }
    });
  }

  delete(user: User): void {
    this.confirmationService.confirm({
      header: 'Delete User',
      message: `Delete ${user.fullName}? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.userService.remove(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'User Deleted', detail: `${user.fullName} removed.` });
            this.load();
          },
          error: (err: HttpErrorResponse) => {
            this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: err.error?.message || 'Could not delete user.' });
          }
        });
      }
    });
  }
}
