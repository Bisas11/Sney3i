import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Report } from '../../../shared/models/report.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-moderate-reviews',
  template: `
    <div class="page">
      <h1>Moderate Content</h1>

      <mat-tab-group>
        <mat-tab label="Unseen Reports ({{ unseenReports.length }})">
          <div class="tab-content">
            <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
            <mat-card *ngFor="let r of unseenReports" class="report-card">
              <mat-card-content>
                <div class="report-header">
                  <mat-chip color="warn" highlighted>{{ r.review_id ? 'Review' : 'Service' }} Report</mat-chip>
                  <span class="date">{{ r.created_at | date:'mediumDate' }}</span>
                </div>
                <p class="comment">{{ r.comment }}</p>
                <div class="report-actions">
                  <button mat-stroked-button color="primary" (click)="markSeen(r)" [disabled]="processing[r.id]">
                    <mat-icon>done</mat-icon> Mark Seen
                  </button>
                  <button mat-raised-button color="warn" *ngIf="r.review_id"
                          (click)="deleteReview(r)" [disabled]="processing[r.id]">
                    <mat-icon>delete</mat-icon> Delete Review
                  </button>
                  <button mat-raised-button color="warn" *ngIf="r.service_id"
                          (click)="deleteService(r)" [disabled]="processing[r.id]">
                    <mat-icon>delete</mat-icon> Delete Service
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
            <p *ngIf="!loading && unseenReports.length === 0" class="empty">No unseen reports.</p>
          </div>
        </mat-tab>
        <mat-tab label="All Reports">
          <div class="tab-content">
            <mat-card *ngFor="let r of allReports" class="report-card" [ngClass]="r.status">
              <mat-card-content>
                <div class="report-header">
                  <mat-chip>{{ r.review_id ? 'Review' : 'Service' }}</mat-chip>
                  <span class="status-chip" [ngClass]="r.status">{{ r.status }}</span>
                  <span class="date">{{ r.created_at | date:'mediumDate' }}</span>
                </div>
                <p class="comment">{{ r.comment }}</p>
              </mat-card-content>
            </mat-card>
            <p *ngIf="allReports.length === 0" class="empty">No reports found.</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
    .tab-content { padding: 16px 0; display: flex; flex-direction: column; gap: 12px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .report-card { border-radius: 16px !important; }
    .report-card.unseen { border-left: 4px solid #D50000; }
    .report-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .report-header .date { color: #938F99; font-size: 13px; margin-left: auto; }
    .comment { color: #64748b; line-height: 1.6; margin: 0 0 8px; }
    .report-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
    .status-chip { font-size: 12px; padding: 2px 10px; border-radius: 12px; }
    .status-chip.unseen { background: #fee2e2; color: #dc2626; }
    .status-chip.seen { background: #dcfce7; color: #16a34a; }
    .empty { text-align: center; color: #938F99; padding: 32px; }
  `]
})
export class ModerateReviewsComponent implements OnInit {
  unseenReports: Report[] = [];
  allReports: Report[] = [];
  loading = false;
  processing: Record<string, boolean> = {};

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.adminService.getReports('unseen').subscribe({
      next: r => { this.unseenReports = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.adminService.getReports().subscribe(r => this.allReports = r);
  }

  markSeen(report: Report): void {
    this.processing[report.id] = true;
    this.adminService.markReportSeen(report.id).subscribe({
      next: () => {
        this.unseenReports = this.unseenReports.filter(r => r.id !== report.id);
        const found = this.allReports.find(r => r.id === report.id);
        if (found) found.status = 'seen';
        this.processing[report.id] = false;
        this.snackBar.open('Report marked as seen.', 'Close', { duration: 3000 });
      },
      error: () => { this.processing[report.id] = false; }
    });
  }

  deleteReview(report: Report): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Review', message: 'Delete this review permanently?' }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed && report.review_id) {
        this.processing[report.id] = true;
        this.adminService.deleteReview(report.review_id, `Reported: ${report.comment}`).subscribe({
          next: () => {
            this.unseenReports = this.unseenReports.filter(r => r.id !== report.id);
            this.allReports = this.allReports.filter(r => r.id !== report.id);
            this.snackBar.open('Review deleted.', 'Close', { duration: 3000 });
          },
          error: () => { this.processing[report.id] = false; }
        });
      }
    });
  }

  deleteService(report: Report): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Service', message: 'Delete this service permanently?' }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed && report.service_id) {
        this.processing[report.id] = true;
        this.adminService.deleteService(report.service_id, `Reported: ${report.comment}`).subscribe({
          next: () => {
            this.unseenReports = this.unseenReports.filter(r => r.id !== report.id);
            this.allReports = this.allReports.filter(r => r.id !== report.id);
            this.snackBar.open('Service deleted.', 'Close', { duration: 3000 });
          },
          error: () => { this.processing[report.id] = false; }
        });
      }
    });
  }
}
