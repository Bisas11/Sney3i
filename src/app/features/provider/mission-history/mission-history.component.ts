import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { ServiceRequest } from '../../../shared/models/request.model';

@Component({
  selector: 'app-mission-history',
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Missions</h1>
          <p class="subtitle">Track requests, client details and mission progress.</p>
        </div>
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
              <mat-option value="">All</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="accepted">Accepted</mat-option>
              <mat-option value="in_progress">In Progress</mat-option>
              <mat-option value="done">Done</mat-option>
              <mat-option value="rejected">Rejected</mat-option>
              <mat-option value="cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Sort</mat-label>
            <mat-select [(ngModel)]="sortOrder" (ngModelChange)="applyFilters()">
              <mat-option value="desc">Newest first</mat-option>
              <mat-option value="asc">Oldest first</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>

      <div class="missions-grid" *ngIf="!loading && filteredMissions.length > 0">
        <mat-card class="mission-card" *ngFor="let mission of filteredMissions" (click)="openMission(mission)">
          <mat-card-content>
            <div class="mission-top">
              <div class="mission-icon"><mat-icon>assignment</mat-icon></div>
              <div class="mission-title">
                <span>{{ (mission.start_date || mission.created_at) | date:'mediumDate' }}</span>
                <h3>{{ mission.service?.title || 'Untitled service' }}</h3>
              </div>
              <app-status-badge [status]="mission.status"></app-status-badge>
            </div>
            <p class="mission-message">{{ mission.client_message || 'No client message provided.' }}</p>
            <div class="mission-meta">
              <div>
                <mat-icon>person</mat-icon>
                <span>{{ mission.client?.name || 'Unknown client' }}</span>
              </div>
              <div>
                <mat-icon>schedule</mat-icon>
                <span>{{ (mission.start_date || mission.created_at) | date:'shortTime' }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button color="primary" (click)="openMission(mission); $event.stopPropagation()">
              View Details
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <mat-card *ngIf="!loading && filteredMissions.length === 0" class="empty-card">
        <mat-icon>assignment_turned_in</mat-icon>
        <h3>No missions found</h3>
        <p>Try a different status filter or sort order.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-bottom: 24px; }
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .subtitle { color: #64748b; margin: 6px 0 0; }
    .filters { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-start; }
    .filters mat-form-field { width: 180px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .missions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
    .mission-card { border-radius: 16px !important; cursor: pointer; overflow: hidden; transition: transform .18s ease, box-shadow .18s ease; }
    .mission-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(15, 23, 42, .08) !important; }
    .mission-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: flex-start; }
    .mission-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #eff6ff; color: #076ab8; }
    .mission-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .mission-title span { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .mission-title h3 { color: #0f172a; font-size: 17px; line-height: 1.35; margin: 4px 0 0; }
    .mission-message { color: #475569; font-size: 14px; line-height: 1.55; margin: 18px 0; }
    .mission-meta { display: grid; gap: 8px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .mission-meta div { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; min-width: 0; }
    .mission-meta mat-icon { color: #076ab8; font-size: 18px; width: 18px; height: 18px; }
    mat-card-actions { padding: 0 16px 16px !important; }
    mat-card-actions button { display: inline-flex; align-items: center; gap: 6px; }
    mat-card-actions mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .empty-card { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; color: #64748b; padding: 40px 24px; border-radius: 16px !important; }
    .empty-card mat-icon { color: #94a3b8; font-size: 44px; width: 44px; height: 44px; }
    .empty-card h3 { margin: 0; color: #0f172a; font-size: 18px; }
    .empty-card p { margin: 0; }
    @media (max-width: 640px) {
      .filters { width: 100%; }
      .filters mat-form-field { width: 100%; }
      .mission-top { grid-template-columns: auto minmax(0, 1fr); }
      .mission-top app-status-badge { grid-column: 1 / -1; justify-self: start; }
    }
  `]
})
export class MissionHistoryComponent implements OnInit {
  missions: ServiceRequest[] = [];
  filteredMissions: ServiceRequest[] = [];
  loading = false;
  statusFilter = '';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(private requestService: RequestService, private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.requestService.getMissions().subscribe({
      next: reqs => {
        this.missions = reqs;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    const filtered = this.statusFilter
      ? this.missions.filter(m => m.status === this.statusFilter)
      : [...this.missions];
    filtered.sort((a, b) => {
      const da = new Date(a.start_date || a.created_at || 0).getTime();
      const db = new Date(b.start_date || b.created_at || 0).getTime();
      return this.sortOrder === 'asc' ? da - db : db - da;
    });
    this.filteredMissions = filtered;
  }

  openMission(mission: ServiceRequest): void {
    this.router.navigate(['/service-requests/missions', mission.id]);
  }
}
