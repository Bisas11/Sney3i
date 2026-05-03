import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { ReviewService } from '../../../core/services/review.service';
import { ServiceRequest } from '../../../shared/models/request.model';
import { Review } from '../../../shared/models/review.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-client-reviews',
  template: `
    <div class="page">
      <h1>My Reviews</h1>

      <!-- Requests awaiting review -->
      <ng-container *ngIf="pendingReviewRequests.length > 0">
        <h2>Services Awaiting Your Review</h2>
        <div class="pending-list">
          <mat-card *ngFor="let r of pendingReviewRequests" class="pending-card">
            <mat-card-content>
              <div class="pending-header">
                <div class="pending-info">
                  <strong>{{ r.service?.title }}</strong>
                  <span>by {{ r.prestataire?.name || '—' }}</span>
                  <span class="date">{{ (r.start_date || r.created_at) | date:'mediumDate' }}</span>
                </div>
                <button mat-stroked-button color="primary"
                        *ngIf="reviewingRequest?.id !== r.id"
                        (click)="openReview(r)">
                  <mat-icon>star</mat-icon> Write Review
                </button>
              </div>

              <!-- Inline review form -->
              <div *ngIf="reviewingRequest?.id === r.id" class="inline-review">
                <p class="review-prompt">How would you rate this service?</p>
                <div class="star-picker">
                  <mat-icon *ngFor="let s of [1,2,3,4,5]"
                    [class.filled]="s <= selectedScore"
                    (mouseenter)="hoverScore = s"
                    (mouseleave)="hoverScore = 0"
                    [class.hover]="s <= hoverScore"
                    (click)="selectedScore = s">
                    {{ s <= (hoverScore || selectedScore) ? 'star' : 'star_border' }}
                  </mat-icon>
                  <span class="score-label" *ngIf="selectedScore > 0">{{ scoreLabels[selectedScore - 1] }}</span>
                </div>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Comment (optional)</mat-label>
                  <textarea matInput [(ngModel)]="reviewComment" rows="3"
                    placeholder="Share your experience with this service..."></textarea>
                </mat-form-field>
                <div class="review-actions">
                  <button mat-button (click)="cancelReview()">Cancel</button>
                  <button mat-raised-button color="primary"
                    [disabled]="selectedScore === 0 || submittingReview"
                    (click)="submitReview(r)">
                    {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>

      <!-- Already reviewed requests -->
      <h2>Submitted Reviews</h2>
      <div class="reviews-list">
        <!-- In-session submitted reviews (have full score+comment) -->
        <mat-card *ngFor="let rev of sessionReviews" class="review-card">
          <mat-card-content>
            <div class="review-header">
              <strong>{{ rev._serviceTitle }}</strong>
              <app-star-rating [rating]="rev.score" [showValue]="false"></app-star-rating>
              <span class="date">{{ rev.created_at | date:'mediumDate' }}</span>
            </div>
            <p *ngIf="rev.commentaire">{{ rev.commentaire }}</p>
            <p *ngIf="!rev.commentaire" class="no-comment">No comment left.</p>
          </mat-card-content>
        </mat-card>

        <!-- Previously reviewed requests (only review_id available) -->
        <mat-card *ngFor="let r of reviewedRequests" class="review-card reviewed-only">
          <mat-card-content>
            <div class="review-header">
              <strong>{{ r.service?.title }}</strong>
              <span class="reviewed-badge"><mat-icon>check_circle</mat-icon> Reviewed</span>
              <span class="date">{{ (r.start_date || r.created_at) | date:'mediumDate' }}</span>
            </div>
            <p class="provider-name">by {{ r.prestataire?.name || '—' }}</p>
          </mat-card-content>
        </mat-card>

        <p *ngIf="reviewedRequests.length === 0 && sessionReviews.length === 0 && pendingReviewRequests.length === 0"
           class="empty">You haven't written any reviews yet.</p>
        <p *ngIf="reviewedRequests.length === 0 && sessionReviews.length === 0 && pendingReviewRequests.length > 0"
           class="empty">No submitted reviews yet. Rate the services above!</p>
      </div>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .page h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 24px 0 14px; }
    .pending-list { display: flex; flex-direction: column; gap: 12px; }
    .pending-card, .review-card { border-radius: 16px !important; }
    .reviews-list { display: flex; flex-direction: column; gap: 12px; }
    .pending-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
    .pending-info { display: flex; flex-direction: column; gap: 4px; }
    .pending-info strong { font-size: 15px; color: #0f172a; font-weight: 700; }
    .pending-info span { color: #64748b; font-size: 13px; }
    .review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
    .review-header strong { font-size: 15px; color: #0f172a; font-weight: 700; }
    .review-header .date { color: #94a3b8; font-size: 13px; margin-left: auto; }
    .review-card p { color: #64748b; line-height: 1.6; margin: 0; font-size: 14px; }
    .review-card.reviewed-only { border-left: 3px solid #e2e8f0; }
    .provider-name { color: #94a3b8; font-size: 13px; margin: 0; }
    .no-comment { color: #94a3b8; font-style: italic; }
    .reviewed-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #16a34a; font-weight: 600; }
    .reviewed-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .empty { text-align: center; color: #938F99; padding: 32px; }
    .date { color: #94a3b8; font-size: 13px; }
    /* Inline review form */
    .inline-review { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .review-prompt { font-size: 14px; font-weight: 600; color: #334155; margin: 0 0 12px; }
    .star-picker { display: flex; align-items: center; gap: 4px; margin-bottom: 16px; }
    .star-picker mat-icon { font-size: 36px; width: 36px; height: 36px; cursor: pointer; color: #e2e8f0; transition: color 0.12s; }
    .star-picker mat-icon.filled, .star-picker mat-icon.hover { color: #f59e0b; }
    .score-label { margin-left: 8px; font-size: 14px; font-weight: 600; color: #f59e0b; }
    .full-width { width: 100%; }
    .review-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  `]
})
export class ClientReviewsComponent implements OnInit {
  pendingReviewRequests: ServiceRequest[] = [];
  reviewedRequests: ServiceRequest[] = [];
  /** Reviews submitted in this session (have full score+comment data) */
  sessionReviews: (Review & { _serviceTitle?: string })[] = [];

  reviewingRequest: ServiceRequest | null = null;
  selectedScore = 0;
  hoverScore = 0;
  reviewComment = '';
  submittingReview = false;

  readonly scoreLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  constructor(
    private requestService: RequestService,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.requestService.getClientHistory().subscribe(reqs => {
      this.pendingReviewRequests = reqs.filter(r => r.can_review);
      this.reviewedRequests = reqs.filter(r => r.review_id);
    });
  }

  openReview(request: ServiceRequest): void {
    this.reviewingRequest = request;
    this.selectedScore = 0;
    this.hoverScore = 0;
    this.reviewComment = '';
  }

  cancelReview(): void {
    this.reviewingRequest = null;
  }

  submitReview(request: ServiceRequest): void {
    if (this.selectedScore === 0) return;
    this.submittingReview = true;
    this.reviewService.createReview(
      request.id,
      this.selectedScore,
      this.reviewComment || undefined
    ).subscribe({
      next: (review) => {
        const enriched = { ...review, _serviceTitle: request.service?.title };
        this.sessionReviews.unshift(enriched);
        request.can_review = false;
        request.review_id = review.id;
        this.pendingReviewRequests = this.pendingReviewRequests.filter(r => r.id !== request.id);
        this.reviewingRequest = null;
        this.submittingReview = false;
        this.snackBar.open('Review submitted!', 'Close', { duration: 3000 });
      },
      error: err => {
        this.submittingReview = false;
        this.snackBar.open(err?.error?.error?.message || 'Failed to submit', 'Close', { duration: 3000 });
      }
    });
  }
}
