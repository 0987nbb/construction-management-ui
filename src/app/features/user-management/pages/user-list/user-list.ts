import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserManagementService } from '../../services/user-management';
import { User } from '../../models/user.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { UserFormComponent } from '../user-form/user-form';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, DialogModule, UserFormComponent],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserManagementService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  users: User[] = [];
  loading = false;
  error = '';

  search = '';
  showFormDialog = false;
  editingUserId: string | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

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

  onboardingLabel(user: User): string {
    return user.isFirstLogin ? 'Invite Pending' : 'Active';
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.userService.getAll({ search: this.search }).subscribe({
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

  onSearchChange(): void {
    this.search$.next(this.search.trim());
  }

  clearSearch(): void {
    this.search = '';
    this.load();
  }

  openCreateDialog(): void {
    this.editingUserId = null;
    this.showFormDialog = true;
  }

  openEditDialog(user: User): void {
    this.editingUserId = user.id;
    this.showFormDialog = true;
  }

  closeFormDialog(): void {
    this.showFormDialog = false;
    this.editingUserId = null;
  }

  handleFormSaved(): void {
    this.closeFormDialog();
    this.load();
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'User saved successfully.' });
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
