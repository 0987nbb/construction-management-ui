import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-section.html',
  styleUrl: './form-section.scss'
})
export class FormSectionComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
