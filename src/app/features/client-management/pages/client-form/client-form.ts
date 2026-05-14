import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientManagementService } from '../../services/client-management.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormShellComponent } from '../../../../shared/ui/form-shell/form-shell';
import { FormSectionComponent } from '../../../../shared/ui/form-section/form-section';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, FormShellComponent, FormSectionComponent],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientManagementService);
  @Input() clientIdInput: string | null = null;
  @Input() inDialog = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  clientId: string | null = null;
  error = '';
  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    company: ['', [Validators.required, Validators.minLength(2)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.clientId = this.clientIdInput ?? this.route.snapshot.paramMap.get('id');
    if (!this.clientId) return;

    this.loading = true;
    this.clientService.getById(this.clientId).subscribe({
      next: (res) => {
        this.form.patchValue({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          address: res.data.address,
          company: res.data.company,
          isActive: res.data.isActive
        });
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to load client details.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload = {
      name: v.name || '',
      email: v.email || '',
      phone: v.phone || '',
      address: v.address || '',
      company: v.company || '',
      isActive: !!v.isActive
    };

    this.error = '';
    this.loading = true;

    if (!this.clientId) {
      this.clientService.create(payload).subscribe({
        next: () => {
          this.loading = false;
          this.finishSuccess();
        },
        error: (err: HttpErrorResponse) => {
          this.error = err.error?.message || 'Failed to create client.';
          this.loading = false;
        }
      });
      return;
    }

    this.clientService.update(this.clientId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.finishSuccess();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to update client.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    if (this.inDialog) {
      this.cancelled.emit();
      return;
    }
    this.router.navigateByUrl('/clients');
  }

  private finishSuccess(): void {
    if (this.inDialog) {
      this.saved.emit();
      return;
    }
    this.router.navigateByUrl('/clients');
  }
}
