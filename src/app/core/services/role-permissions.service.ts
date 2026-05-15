import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth';

export type AppRole = 'Admin' | 'Project Manager' | 'Engineer' | 'Accountant' | 'Client';

@Injectable({ providedIn: 'root' })
export class RolePermissionsService {
  private readonly authService = inject(AuthService);

  getRole(): AppRole | null {
    return this.authService.getRole() as AppRole | null;
  }

  // Module 2 — Users
  canManageUsers(): boolean {
    return this.getRole() === 'Admin';
  }

  // Module 3 — Clients
  canManageClients(): boolean {
    return this.getRole() === 'Admin';
  }

  canReadClients(): boolean {
    const role = this.getRole();
    return role === 'Admin' || role === 'Project Manager';
  }

  // Module 4 — Projects
  canReadProjects(): boolean {
    const role = this.getRole();
    return !!role && role !== undefined;
  }

  canReadProjectFinancials(): boolean {
    const role = this.getRole();
    return role === 'Admin' || role === 'Project Manager' || role === 'Accountant';
  }

  canManageProjects(): boolean {
    const role = this.getRole();
    return role === 'Admin' || role === 'Project Manager';
  }

  canDeleteProjects(): boolean {
    return this.getRole() === 'Admin';
  }

  // Module 5 — Sites
  canReadSites(): boolean {
    const role = this.getRole();
    return role === 'Admin' || role === 'Project Manager' || role === 'Engineer' || role === 'Accountant' || role === 'Client';
  }

  canManageSites(): boolean {
    const role = this.getRole();
    return role === 'Admin' || role === 'Project Manager';
  }

  canDeleteSites(): boolean {
    return this.getRole() === 'Admin';
  }

  canAssignSiteEngineer(): boolean {
    const role = this.getRole();
    return role === 'Admin' || role === 'Project Manager';
  }

  canUpdateSiteStatus(): boolean {
    const role = this.getRole();
    return role === 'Admin' || role === 'Project Manager' || role === 'Engineer';
  }

  canUpdateSiteProgress(): boolean {
    return this.canUpdateSiteStatus();
  }

  isReadOnly(): boolean {
    const role = this.getRole();
    return role === 'Accountant' || role === 'Client';
  }
}
