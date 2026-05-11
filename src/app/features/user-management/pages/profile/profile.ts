import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserManagementService } from '../../services/user-management';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserManagementService);
  form = this.fb.group({ fullName: ['', [Validators.required, Validators.minLength(3)]], email: [{ value: '', disabled: true }], role: [{ value: '', disabled: true }], phoneNumber: [''] });

  ngOnInit(): void { this.userService.getProfile().subscribe(res => this.form.patchValue(res.data)); }
  save(): void { if (this.form.invalid) return; const v = this.form.getRawValue(); this.userService.updateProfile({ fullName: v.fullName || '', phoneNumber: v.phoneNumber || undefined }).subscribe(); }
}
