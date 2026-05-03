import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestService } from '../../../core/services/request.service';
import { ReviewService } from '../../../core/services/review.service';
import { ServiceRequest } from '../../../shared/models/request.model';

@Component({
  selector: 'app-history-detail',
  template: `
    <div class="page">
      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      <mat-card *ngIf="!loading && request" class="detail-card">
        <mat-card-header>
          <mat-card-title>{{ request.service?.title }}</mat-card-title>
          <mat-card-subtitle>{{ (request.start_date || request.created_at) | date:'medium' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-grid">
            <div>
              <h3>Provider</h3>
              <p><mat-icon>person</mat-icon> {{ request.prestataire?.name || 'Unknown' }}</p>
              <p *ngIf="request.prestataire?.email"><mat-icon>mail</mat-icon> {{ request.prestataire?.email }}</p>
              <p *ngIf="request.prestataire?.phone_number"><mat-icon>phone</mat-icon> {{ request.prestataire?.phone_number }}</p>
            </div>
            <div>
              <h3>Status</h3>
              <app-status-badge [status]="request.status"></app-status-badge>
              <p class="message">{{ request.client_message || 'No message provided.' }}</p>
            </div>
          </div>

          <div class="inline-review" *ngIf="request.can_review">
            <h3>Leave a Review</h3>
            <div class="star-picker">
              <mat-icon *ngFor="let s of [1,2,3,4,5]"
                [class.filled]="s <= selectedScore"
                (click)="selectedScore = s">{{ s <= selectedScore ? 'star' : 'star_border' }}</mat-icon>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Comment (optional)</mat-label>
              <textarea matInput [(ngModel)]="reviewComment" rows="3"></textarea>
            </mat-form-field>
            <button mat-raised-button color="primary" [disabled]="selectedScore === 0 || submittingReview" (click)="submitReview()">
              {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>
      <p *ngIf="!loading && !request" class="empty">Request not found.</p>
    </div>
  `,
  styles: [`
    .page { max-width: 880px; margin: 0 auto; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .detail-card { border-radius: 16px !important; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
    h3 { font-size: 15px; color: #0f172a; margin: 0 0 12px; }
    p { display: flex; align-items: center; gap: 8px; color: #64748b; margin: 8px 0; }
    p mat-icon { font-size: 18px; width: 18px; height: 18px; color: #076ab8; }
    .message { align-items: flex-start; line-height: 1.6; margin-top: 16px; }
    .inline-review { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
    .star-picker { display: flex; gap: 4px; margin-bottom: 16px; }
    .star-picker mat-icon { font-size: 32px; width: 32px; height: 32px; cursor: pointer; color: #e2e8f0; }
    .star-picker mat-icon.filled { color: #f59e0b; }
    .full-width { width: 100%; }
    .empty { text-align: center; color: #938F99; padding: 48px; }
  `]
})
export class HistoryDetailComponent implements OnInit {
  request: ServiceRequest | null = null;
  loading = false;
  selectedScore = 0;
  reviewComment = '';
  submittingReview = false;

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading = true;
    this.requestService.getClientHistoryById(id).subscribe({
      next: request => {
        this.request = request;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  submitReview(): void {
    if (!this.request || this.selectedScore === 0) return;
    this.submittingReview = true;
    this.reviewService.createReview(this.request.id, this.selectedScore, this.reviewComment || undefined).subscribe({
      next: review => {
        this.request!.can_review = false;
        this.request!.review_id = review.id;
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
