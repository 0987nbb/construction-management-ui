import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pm-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-card dash p-4">
      <h2>Manager Dashboard</h2>
      <p>Portfolio visibility across active projects, site progress, and delivery risk.</p>
      <div class="grid">
        <article><h3>Projects</h3><p>Monitor milestones, owners, and deadlines.</p></article>
        <article><h3>Progress</h3><p>Track execution health and blocker trends.</p></article>
        <article><h3>Sites</h3><p>Review site-level updates and workforce readiness.</p></article>
      </div>
    </section>
  `,
  styles: [
    `.dash h2{margin:0}.dash p{color:#64748b}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem;margin-top:1rem}.grid article{border:1px solid #e2e8f0;border-radius:.75rem;padding:.85rem;background:#f8fafc}`
  ]
})
export class ProjectManagerDashboardComponent {}
