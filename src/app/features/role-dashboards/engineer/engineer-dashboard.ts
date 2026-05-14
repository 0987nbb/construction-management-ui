import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-engineer-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-card dash p-4">
      <h2>Engineer Dashboard</h2>
      <p>Execution workspace for assigned sites, tasks, and daily reporting.</p>
      <div class="grid">
        <article><h3>Assigned Sites</h3><p>View active site responsibilities and status.</p></article>
        <article><h3>Tasks</h3><p>Prioritize pending work items and technical checks.</p></article>
        <article><h3>Daily Updates</h3><p>Capture field notes, quality checks, and blockers.</p></article>
      </div>
    </section>
  `,
  styles: [
    `.dash h2{margin:0}.dash p{color:#64748b}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem;margin-top:1rem}.grid article{border:1px solid #e2e8f0;border-radius:.75rem;padding:.85rem;background:#f8fafc}`
  ]
})
export class EngineerDashboardComponent {}
