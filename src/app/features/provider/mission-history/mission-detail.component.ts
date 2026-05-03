import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestService } from '../../../core/services/request.service';
import { ServiceRequest, ServiceRequestStatus } from '../../../shared/models/request.model';

@Component({
  selector: 'app-mission-detail',
  template: `
    <div class="page">
      <a mat-button color="primary" routerLink="/service-requests/missions" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        Back to Missions
      </a>

      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>

      <ng-container *ngIf="!loading && mission">
        <mat-card class="hero-card">
          <mat-card-content>
            <div class="hero-content">
              <div>
                <span class="eyebrow">{{ (mission.start_date || mission.created_at) | date:'medium' }}</span>
                <h1>{{ mission.service?.title || 'Mission' }}</h1>
                <p>{{ mission.client_message || 'No message from client.' }}</p>
              </div>
              <app-status-badge [status]="mission.status"></app-status-badge>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="detail-grid">
          <mat-card class="info-card">
            <mat-card-header>
              <div mat-card-avatar class="card-icon"><mat-icon>person</mat-icon></div>
              <mat-card-title>Client</mat-card-title>
              <mat-card-subtitle>Contact details</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-list">
                <div>
                  <mat-icon>badge</mat-icon>
                  <span>{{ mission.client?.name || 'Unknown client' }}</span>
                </div>
                <div *ngIf="mission.client?.email">
                  <mat-icon>mail</mat-icon>
                  <span>{{ mission.client?.email }}</span>
                </div>
                <div *ngIf="mission.client?.phone_number">
                  <mat-icon>phone</mat-icon>
                  <span>{{ mission.client?.phone_number }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-header>
              <div mat-card-avatar class="card-icon"><mat-icon>work_history</mat-icon></div>
              <mat-card-title>Mission Details</mat-card-title>
              <mat-card-subtitle>Service and timeline</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-list">
                <div>
                  <mat-icon>home_repair_service</mat-icon>
                  <span>{{ mission.service?.title || 'Untitled service' }}</span>
                </div>
                <div>
                  <mat-icon>event</mat-icon>
                  <span>{{ (mission.start_date || mission.created_at) | date:'mediumDate' }}</span>
                </div>
                <div *ngIf="mission.service?.price">
                  <mat-icon>payments</mat-icon>
                  <span>{{ mission.service?.price }} DT</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="transition-card" *ngIf="mission.allowed_next_statuses?.length">
          <mat-card-content>
            <div class="transition-content">
              <div>
                <h2>Update Mission Status</h2>
                <p>Move this request to the next valid state when the work changes.</p>
              </div>
              <div class="transition-controls">
                <mat-form-field appearance="outline" class="status-select">
                  <mat-label>Next status</mat-label>
                  <mat-select [(ngModel)]="nextStatus">
                    <mat-option *ngFor="let s of mission.allowed_next_statuses" [value]="s">
                      {{ s.replace('_', ' ') | titlecase }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="primary" [disabled]="!nextStatus || saving" (click)="transition()">
                  <mat-icon>sync</mat-icon>
                  {{ saving ? 'Updating...' : 'Update Status' }}
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <mat-card *ngIf="!loading && !mission" class="empty-card">
        <mat-icon>error_outline</mat-icon>
        <h3>Mission not found</h3>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { max-width: 960px; margin: 0 auto; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 16px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .hero-card, .info-card, .transition-card, .empty-card { border-radius: 16px !important; }
    .hero-card { margin-bottom: 18px; overflow: hidden; }
    .hero-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap; }
    .eyebrow { display: block; color: #076ab8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
    h1 { color: #0f172a; font-size: 30px; line-height: 1.2; margin: 0 0 10px; }
    .hero-content p { color: #475569; line-height: 1.6; margin: 0; max-width: 680px; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-bottom: 18px; }
    .card-icon { display: flex; align-items: center; justify-content: center; background: #eff6ff; color: #076ab8; border-radius: 12px; }
    .card-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    mat-card-title { color: #0f172a; font-size: 17px; font-weight: 700; }
    .info-list { display: grid; gap: 12px; padding-top: 6px; }
    .info-list div { display: flex; align-items: center; gap: 10px; color: #475569; min-width: 0; }
    .info-list span { overflow-wrap: anywhere; }
    .info-list mat-icon { color: #076ab8; font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .transition-content { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
    .transition-content h2 { color: #0f172a; font-size: 20px; margin: 0 0 4px; }
    .transition-content p { color: #64748b; margin: 0; }
    .transition-controls { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
    .status-select { width: 220px; }
    .transition-controls button { min-height: 48px; display: inline-flex; align-items: center; gap: 6px; }
    .empty-card { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; color: #64748b; padding: 48px 24px; }
    .empty-card mat-icon { font-size: 44px; width: 44px; height: 44px; color: #94a3b8; }
    .empty-card h3 { margin: 0; color: #0f172a; }
    @media (max-width: 640px) {
      .status-select, .transition-controls, .transition-controls button { width: 100%; }
    }
  `]
})
export class MissionDetailComponent implements OnInit {
  mission: ServiceRequest | null = null;
  loading = false;
  saving = false;
  nextStatus: ServiceRequestStatus | '' = '';

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading = true;
    this.requestService.getMissionById(id).subscribe({
      next: mission => {
        this.mission = mission;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  transition(): void {
    if (!this.mission || !this.nextStatus) return;
    this.saving = true;
    this.requestService.transitionStatus(this.mission.id, this.nextStatus).subscribe({
      next: () => {
        this.requestService.getMissionById(this.mission!.id).subscribe(mission => {
          this.mission = mission;
          this.nextStatus = '';
          this.saving = false;
          this.snackBar.open('Mission status updated.', 'Close', { duration: 3000 });
        });
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.error?.message || 'Could not update status', 'Close', { duration: 4000 });
      }
    });
  }
}
