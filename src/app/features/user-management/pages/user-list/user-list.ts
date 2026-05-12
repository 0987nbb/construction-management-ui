import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserManagementService } from '../../services/user-management';
import { User, UserRole } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserManagementService);

  users: User[] = [];
  loading = false;
  error = '';

  search = '';
  role: UserRole | '' = '';
  isActive: '' | 'true' | 'false' = '';

  readonly roles: UserRole[] = ['Admin', 'Project Manager', 'Engineer', 'Accountant', 'Client'];

  onboardingLabel(user: User): string {
    if (user.mustChangePassword) return 'Invite pending';
    if (user.isFirstLogin) return 'First login pending';
    return 'Active';
  }

  resetPassword(user: User): void {
    const pwd = window.prompt(
      `Set a new temporary password for ${user.fullName} (min 8 chars, upper, lower, number, special):`
    );
    if (pwd == null || pwd.length < 8) return;
    this.userService.adminResetTemporaryPassword(user.id, pwd).subscribe({
      next: (res) => {
        const msg = res.data?.temporaryPassword
          ? `Temporary password (copy now): ${res.data.temporaryPassword}`
          : res.message || 'Password reset.';
        window.alert(msg);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        window.alert(err.error?.message || 'Reset failed.');
      }
    });
  }

  ngOnInit(): void { this.load(); }

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
    this.userService.updateStatus(user.id, !user.isActive).subscribe({ next: () => this.load() });
  }

  delete(user: User): void {
    if (!confirm(`Delete ${user.fullName}?`)) return;
    this.userService.remove(user.id).subscribe({ next: () => this.load() });
  }
}
