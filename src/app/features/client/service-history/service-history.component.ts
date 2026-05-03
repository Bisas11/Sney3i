import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { ReviewService } from '../../../core/services/review.service';
import { ServiceRequest } from '../../../shared/models/request.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-history',
  template: `
    <div class="page">
      <h1>Service History</h1>
      <div class="history-list">
        <mat-card *ngFor="let r of requests" class="history-card" (click)="openDetail(r)">
          <mat-card-content>
            <div class="history-row">
              <div class="info">
                <h3>{{ r.service?.title }}</h3>
                <p><mat-icon>person</mat-icon> {{ r.prestataire?.name || '—' }}</p>
                <p><mat-icon>event</mat-icon> {{ (r.start_date || r.created_at) | date:'mediumDate' }}</p>
              </div>
              <div class="actions">
                <app-status-badge [status]="r.status"></app-status-badge>
                <button mat-stroked-button color="primary" class="rate-btn"
                        *ngIf="r.can_review" (click)="openReview(r); $event.stopPropagation()">
                  <mat-icon>star</mat-icon> Rate
                </button>
                <span *ngIf="r.review_id" class="reviewed-badge">
                  <mat-icon>star</mat-icon> Reviewed
                </span>
              </div>
            </div>
            <!-- Inline review form -->
            <div *ngIf="reviewingRequest?.id === r.id" class="inline-review">
              <div class="star-picker">
                <mat-icon *ngFor="let s of [1,2,3,4,5]"
                  [class.filled]="s <= selectedScore"
                  (click)="selectedScore = s; $event.stopPropagation()">{{ s <= selectedScore ? 'star' : 'star_border' }}</mat-icon>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Comment (optional)</mat-label>
                <textarea matInput [(ngModel)]="reviewComment" rows="3"
                  placeholder="Share your experience..." (click)="$event.stopPropagation()"></textarea>
              </mat-form-field>
              <div class="review-actions">
                <button mat-button (click)="cancelReview(); $event.stopPropagation()">Cancel</button>
                <button mat-raised-button color="primary"
                  [disabled]="selectedScore === 0 || submittingReview"
                (click)="submitReview(r); $event.stopPropagation()">
                  {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        <p *ngIf="requests.length === 0" class="empty">No service requests yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
    .history-list { display: flex; flex-direction: column; gap: 16px; }
    .history-card { border-radius: 16px !important; cursor: pointer; }
    .history-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .info h3 { font-size: 18px; font-weight: 600; margin: 0 0 8px; color: #0f172a; }
    .info p { display: flex; align-items: center; gap: 6px; color: #64748b; margin: 4px 0; font-size: 14px; }
    .info mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .rate-btn { margin-top: 4px; }
    .reviewed-badge { display: flex; align-items: center; gap: 4px; color: #f59e0b; font-size: 13px; }
    .empty { text-align: center; color: #938F99; padding: 32px; }
    .inline-review { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .star-picker { display: flex; gap: 4px; margin-bottom: 16px; }
    .star-picker mat-icon { font-size: 32px; width: 32px; height: 32px; cursor: pointer; color: #e2e8f0; transition: color 0.1s; }
    .star-picker mat-icon.filled { color: #f59e0b; }
    .star-picker mat-icon:hover { color: #f59e0b; }
    .review-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class ServiceHistoryComponent implements OnInit {
  requests: ServiceRequest[] = [];
  reviewingRequest: ServiceRequest | null = null;
  selectedScore = 0;
  reviewComment = '';
  submittingReview = false;

  constructor(
    private requestService: RequestService,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.requestService.getClientHistory().subscribe(reqs => {
      this.requests = reqs;
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

  submitReview(request: ServiceRequest): void {
    if (this.selectedScore === 0) return;
    this.submittingReview = true;
    this.reviewService.createReview(request.id, this.selectedScore, this.reviewComment || undefined).subscribe({
      next: (review) => {
        request.can_review = false;
        request.review_id = review.id;
        this.reviewingRequest = null;
        this.submittingReview = false;
        this.snackBar.open('Review submitted!', 'Close', { duration: 3000 });
      },
      error: err => {
        this.submittingReview = false;
        this.snackBar.open(err?.error?.error?.message || 'Failed', 'Close', { duration: 3000 });
      }
    });
  }

  openDetail(request: ServiceRequest): void {
    this.router.navigate(['/history', request.id]);
  }
}
