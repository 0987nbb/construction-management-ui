import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-form-shell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './form-shell.html',
  styleUrl: './form-shell.scss'
})
export class FormShellComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() backLink = '';
  @Input() backLabel = 'Back';
  @Input() stickyActions = false;
}
