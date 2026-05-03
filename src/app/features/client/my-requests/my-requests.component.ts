import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { ServiceRequest } from '../../../shared/models/request.model';
import { ReviewService } from '../../../core/services/review.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-requests',
  template: `
    <div class="page">
      <h1>My Requests</h1>
      <mat-card class="table-card">
        <table mat-table [dataSource]="requests" class="full-width">
          <ng-container matColumnDef="provider">
            <th mat-header-cell *matHeaderCellDef>Provider</th>
            <td mat-cell *matCellDef="let r">{{ r.prestataire?.name || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="service">
            <th mat-header-cell *matHeaderCellDef>Service</th>
            <td mat-cell *matCellDef="let r">{{ r.service?.title }}</td>
          </ng-container>
          <ng-container matColumnDef="requestDate">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let r">{{ (r.start_date || r.created_at) | date:'mediumDate' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r"><app-status-badge [status]="r.status"></app-status-badge></td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let r">
              <button mat-icon-button color="warn" *ngIf="r.can_cancel"
                      matTooltip="Cancel request" (click)="cancelRequest(r)">
                <mat-icon>cancel</mat-icon>
              </button>
              <button mat-icon-button color="accent" *ngIf="r.can_review"
                      matTooltip="Leave a review" (click)="openReview(r)">
                <mat-icon>star</mat-icon>
              </button>
              <span *ngIf="r.review_id" class="reviewed-chip">
                <mat-icon style="font-size:16px;color:#f59e0b">star</mat-icon> Reviewed
              </span>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
        <p *ngIf="requests.length === 0" class="empty">No requests yet.</p>
      </mat-card>

      <!-- Inline review form -->
      <mat-card *ngIf="reviewingRequest" class="review-inline-card">
        <mat-card-header>
          <mat-card-title>Rate: {{ reviewingRequest.service?.title }}</mat-card-title>
          <mat-card-subtitle>by {{ reviewingRequest.prestataire?.name }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="star-picker">
            <mat-icon *ngFor="let s of [1,2,3,4,5]"
              [class.filled]="s <= selectedScore"
              (click)="selectedScore = s">{{ s <= selectedScore ? 'star' : 'star_border' }}</mat-icon>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Comment (optional)</mat-label>
            <textarea matInput [(ngModel)]="reviewComment" rows="3"
              placeholder="Share your experience..."></textarea>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button (click)="cancelReview()">Cancel</button>
          <button mat-raised-button color="primary"
            [disabled]="selectedScore === 0 || submittingReview"
            (click)="submitReview()">
            {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
    .table-card { border-radius: 16px !important; }
    .full-width { width: 100%; }
    .empty { text-align: center; color: #938F99; padding: 32px; }
    .reviewed-chip { display: inline-flex; align-items: center; gap: 2px; font-size: 13px; color: #64748b; }
    .review-inline-card { border-radius: 16px !important; margin-top: 20px; }
    .star-picker { display: flex; gap: 4px; margin-bottom: 16px; }
    .star-picker mat-icon { font-size: 32px; width: 32px; height: 32px; cursor: pointer; color: #e2e8f0; transition: color 0.1s; }
    .star-picker mat-icon.filled { color: #f59e0b; }
    .star-picker mat-icon:hover { color: #f59e0b; }
  `]
})
export class MyRequestsComponent implements OnInit {
  requests: ServiceRequest[] = [];
  displayedColumns = ['provider', 'service', 'requestDate', 'status', 'actions'];
  reviewingRequest: ServiceRequest | null = null;
  selectedScore = 0;
  reviewComment = '';
  submittingReview = false;

  constructor(
    private requestService: RequestService,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.requestService.getClientHistory().subscribe(r => this.requests = r);
  }

  cancelRequest(request: ServiceRequest): void {
    this.requestService.transitionStatus(request.id, 'cancelled').subscribe({
      next: () => { request.status = 'cancelled'; request.can_cancel = false; },
      error: err => this.snackBar.open(err?.error?.error?.message || 'Cannot cancel', 'Close', { duration: 3000 })
    });
  }

  openReview(request: ServiceRequest): void {
    this.reviewingRequest = request;
    this.selectedScore = 0;
    this.reviewComment = '';
  }

  cancelReview(): void {
    this.reviewingRequest = null;
  }

  submitReview(): void {
    if (!this.reviewingRequest || this.selectedScore === 0) return;
    this.submittingReview = true;
    this.reviewService.createReview(
      this.reviewingRequest.id,
      this.selectedScore,
      this.reviewComment || undefined
    ).subscribe({
      next: (review) => {
        this.reviewingRequest!.can_review = false;
        this.reviewingRequest!.review_id = review.id;
        this.reviewingRequest = null;
        this.submittingReview = false;
        this.snackBar.open('Review submitted!', 'Close', { duration: 3000 });
      },
      error: err => {
        this.submittingReview = false;
        this.snackBar.open(err?.error?.error?.message || 'Failed to submit review', 'Close', { duration: 3000 });
      }
    });
  }
}
