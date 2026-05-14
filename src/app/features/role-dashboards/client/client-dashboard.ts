import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-card dash p-4">
      <h2>Client Dashboard</h2>
      <p>Transparent view of project delivery, image updates, and reporting outputs.</p>
      <div class="grid">
        <article><h3>Project Progress</h3><p>Review timeline progress and completion ratio.</p></article>
        <article><h3>Images</h3><p>Access site snapshots and key visual updates.</p></article>
        <article><h3>Reports</h3><p>Download shared reports and formal updates.</p></article>
      </div>
    </section>
  `,
  styles: [
    `.dash h2{margin:0}.dash p{color:#64748b}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem;margin-top:1rem}.grid article{border:1px solid #e2e8f0;border-radius:.75rem;padding:.85rem;background:#f8fafc}`
  ]
})
export class ClientDashboardComponent {}
