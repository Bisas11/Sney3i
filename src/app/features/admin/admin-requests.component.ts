import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { ServiceRequest } from '../../shared/models/request.model';

@Component({
  selector: 'app-admin-requests',
  template: `
    <div class="page">
      <h1>Service Request Oversight</h1>
      <mat-card class="table-card">
        <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
        <table mat-table [dataSource]="requests" class="full-width" *ngIf="!loading">
          <ng-container matColumnDef="service"><th mat-header-cell *matHeaderCellDef>Service</th><td mat-cell *matCellDef="let r">{{ r.service?.title || '—' }}</td></ng-container>
          <ng-container matColumnDef="client"><th mat-header-cell *matHeaderCellDef>Client</th><td mat-cell *matCellDef="let r">{{ r.client?.name || '—' }}</td></ng-container>
          <ng-container matColumnDef="provider"><th mat-header-cell *matHeaderCellDef>Provider</th><td mat-cell *matCellDef="let r">{{ r.prestataire?.name || '—' }}</td></ng-container>
          <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.created_at | date:'mediumDate' }}</td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status"></app-status-badge></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
        <p *ngIf="!loading && requests.length === 0" class="empty">No requests found.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    h1 { font-size:28px; font-weight:700; color:#0f172a; margin:0 0 20px; }
    .table-card { border-radius:16px !important; }
    .full-width { width:100%; }
    .loading { display:flex; justify-content:center; padding:48px; }
    .empty { text-align:center; color:#938F99; padding:32px; }
  `]
})
export class AdminRequestsComponent implements OnInit {
  requests: ServiceRequest[] = [];
  columns = ['service', 'client', 'provider', 'date', 'status'];
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loading = true;
    this.adminService.getServiceRequests().subscribe({
      next: requests => { this.requests = requests; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
