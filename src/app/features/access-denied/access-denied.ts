import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: '<section><h2>Access Denied</h2><p>You are not authorized for this area.</p><a routerLink="/profile">Go to Profile</a></section>'
})
export class AccessDeniedComponent {}
