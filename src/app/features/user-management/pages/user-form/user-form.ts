import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserManagementService } from '../../services/user-management';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserManagementService);

  roles: UserRole[] = ['Admin', 'Project Manager', 'Engineer', 'Accountant', 'Client'];
  userId: string | null = null;
  inviteLink = '';
  inviteExpiry = '';

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    role: ['Client', Validators.required],
    isActive: [true]
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (!this.userId) return;
    this.userService.getById(this.userId).subscribe(res => this.form.patchValue({ ...res.data }));
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    if (!this.userId) {
      this.userService.create(v as any).subscribe((res) => {
        this.inviteLink = res.data.inviteLink;
        this.inviteExpiry = res.data.expiresAtUtc;
      });
      return;
    }

    this.userService.update(this.userId, { fullName: v.fullName || '', phoneNumber: v.phoneNumber || undefined }).subscribe(() => {
      this.userService.assignRole(this.userId!, v.role as UserRole).subscribe(() => {
        this.userService.updateStatus(this.userId!, !!v.isActive).subscribe(() => this.router.navigateByUrl('/users'));
      });
    });
  }

  copyInviteLink(): void {
    if (!this.inviteLink) return;
    navigator.clipboard.writeText(this.inviteLink);
  }
}
