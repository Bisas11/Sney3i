import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { ServiceRequest } from '../../../shared/models/request.model';

@Component({
  selector: 'app-client-dashboard',
  template: `
    <div class="dashboard-page">
      <h1>Client Dashboard</h1>
      <p class="subtitle">Welcome back! Here's an overview of your activity.</p>

      <div class="stats-grid">
        <mat-card class="stat-card pending">
          <mat-icon>hourglass_empty</mat-icon>
          <div>
            <h3>{{ pendingCount }}</h3>
            <p>Pending Requests</p>
          </div>
        </mat-card>
        <mat-card class="stat-card accepted">
          <mat-icon>check_circle</mat-icon>
          <div>
            <h3>{{ acceptedCount }}</h3>
            <p>Accepted Services</p>
          </div>
        </mat-card>
        <mat-card class="stat-card completed">
          <mat-icon>done_all</mat-icon>
          <div>
            <h3>{{ completedCount }}</h3>
            <p>Completed Services</p>
          </div>
        </mat-card>
      </div>

      <mat-card class="recent-card">
        <mat-card-header>
          <mat-card-title>Recent Requests</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="recentRequests" class="full-width">
            <ng-container matColumnDef="provider">
              <th mat-header-cell *matHeaderCellDef>Provider</th>
              <td mat-cell *matCellDef="let r">{{ r.prestataire?.name || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="service">
              <th mat-header-cell *matHeaderCellDef>Service</th>
              <td mat-cell *matCellDef="let r">{{ r.service?.title }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let r">{{ (r.start_date || r.created_at) | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status"></app-status-badge></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit {
  requests: ServiceRequest[] = [];
  recentRequests: ServiceRequest[] = [];
  displayedColumns = ['provider', 'service', 'date', 'status'];
  pendingCount = 0;
  acceptedCount = 0;
  completedCount = 0;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.requestService.getClientHistory().subscribe(reqs => {
      this.requests = reqs;
      this.recentRequests = reqs.slice(0, 5);
      this.pendingCount = reqs.filter(r => r.status === 'pending').length;
      this.acceptedCount = reqs.filter(r => r.status === 'accepted').length;
      this.completedCount = reqs.filter(r => r.status === 'done').length;
    });
  }
}
