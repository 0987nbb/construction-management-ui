import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserManagementService } from '../../services/user-management';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserManagementService);
  users: User[] = [];

  ngOnInit(): void { this.load(); }

  load(): void { this.userService.getAll().subscribe(res => this.users = res.data ?? []); }
  toggle(user: User): void { this.userService.updateStatus(user.id, !user.isActive).subscribe(() => this.load()); }
  delete(user: User): void { this.userService.remove(user.id).subscribe(() => this.load()); }
}
