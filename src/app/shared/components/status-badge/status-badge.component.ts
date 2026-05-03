import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [ngClass]="statusClass">{{ displayStatus }}</span>`,
  styles: [`
    .badge {
      display: inline-block; padding: 4px 12px; border-radius: 20px;
      font-size: 12px; font-weight: 500; text-transform: capitalize;
      letter-spacing: 0.02em;
    }
    .pending { background: #FFF3E0; color: #E65100; }
    .accepted, .approved { background: #E8F5E9; color: #1B5E20; }
    .rejected { background: #FFEBEE; color: #B71C1C; }
    .completed { background: #eff6ff; color: #1e40af; }
    .cancelled { background: #F5F5F5; color: #616161; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get statusClass(): string {
    if (this.status === 'done') return 'completed';
    if (this.status === 'in_progress') return 'accepted';
    return this.status;
  }

  get displayStatus(): string {
    return this.status.replace(/_/g, ' ');
  }
}
