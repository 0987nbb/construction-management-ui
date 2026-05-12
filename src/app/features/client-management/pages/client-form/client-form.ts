import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientManagementService } from '../../services/client-management.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientManagementService);

  clientId: string | null = null;
  error = '';
  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    company: ['', [Validators.required, Validators.minLength(2)]],
    isActive: [true],
    projectName: [''],
    projectCode: ['']
  });

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');
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
          this.router.navigateByUrl('/clients');
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
        const projectName = (v.projectName || '').trim();
        const projectCode = (v.projectCode || '').trim();

        if (!projectName || !projectCode) {
          this.loading = false;
          this.router.navigateByUrl('/clients');
          return;
        }

        this.clientService.linkProject(this.clientId!, { projectName, projectCode }).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigateByUrl('/clients');
          },
          error: (err: HttpErrorResponse) => {
            this.error = err.error?.message || 'Client saved, but project linking failed.';
            this.loading = false;
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Failed to update client.';
        this.loading = false;
      }
    });
  }
}
