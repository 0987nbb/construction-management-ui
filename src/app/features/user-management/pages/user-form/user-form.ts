import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserManagementService } from '../../services/user-management';
import { AssignableStaffRole, UserRole } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormShellComponent } from '../../../../shared/ui/form-shell/form-shell';
import { FormSectionComponent } from '../../../../shared/ui/form-section/form-section';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, FormShellComponent, FormSectionComponent],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserManagementService);

  readonly staffRoles: AssignableStaffRole[] = ['Project Manager', 'Engineer', 'Accountant'];

  get roleOptions(): UserRole[] {
    const loaded = this.loadedRole;
    if (loaded && !this.staffRoles.includes(loaded as AssignableStaffRole))
      return [...this.staffRoles, loaded];
    return [...this.staffRoles];
  }

  get roleSelectOptions(): Array<{ label: string; value: UserRole }> {
    return this.roleOptions.map((role) => ({ label: role, value: role }));
  }

  userId: string | null = null;
  inviteExpiresAtUtc = '';
  error = '';
  success = '';

  loadedRole: UserRole | null = null;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    phoneNumber: [''],
    role: this.fb.nonNullable.control<AssignableStaffRole | UserRole>('Project Manager', Validators.required),
    isActive: [true]
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    const emailCtl = this.form.controls.email;

    if (this.userId) {
      emailCtl.disable({ emitEvent: false });
      this.userService.getById(this.userId).subscribe((res) => {
        const u = res.data;
        if (!u) return;
        this.loadedRole = u.role;
        this.form.patchValue({
          fullName: u.fullName,
          email: u.email,
          phoneNumber: u.phoneNumber ?? '',
          role: u.role as AssignableStaffRole | UserRole,
          isActive: u.isActive
        });
        if (u.role === 'Client' || u.role === 'Admin') {
          this.form.controls.role.disable({ emitEvent: false });
        }
      });
      return;
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.error = '';
    this.success = '';
    const v = this.form.getRawValue();

    if (!this.userId) {
      this.userService
        .create({
          fullName: v.fullName || '',
          email: (v.email || '').trim(),
          role: v.role as UserRole,
          phoneNumber: v.phoneNumber || undefined,
          isActive: !!v.isActive
        })
        .subscribe({
          next: (res) => {
            this.inviteExpiresAtUtc = res.data?.inviteExpiresAtUtc ?? '';
            this.success = res.message || 'User created and invitation sent.';
          },
          error: (err: HttpErrorResponse) => {
            this.error = err.error?.message || 'Failed to create user.';
          }
        });
      return;
    }

    const roleCtrl = this.form.controls.role;
    const roleValue = (roleCtrl.enabled ? roleCtrl.value : this.loadedRole) as UserRole;

    this.userService.update(this.userId, { fullName: v.fullName || '', phoneNumber: v.phoneNumber || undefined }).subscribe(() => {
      const chainRole = () => {
        if (roleCtrl.enabled && roleValue && this.loadedRole && roleValue !== this.loadedRole) {
          return this.userService.assignRole(this.userId!, roleValue);
        }
        return null;
      };
      const chainStatus = () => this.userService.updateStatus(this.userId!, !!v.isActive);

      const r = chainRole();
      if (r) {
        r.subscribe(() => chainStatus().subscribe(() => this.router.navigateByUrl('/users')));
      } else {
        chainStatus().subscribe(() => this.router.navigateByUrl('/users'));
      }
    });
  }

}
