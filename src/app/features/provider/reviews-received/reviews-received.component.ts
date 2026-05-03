import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { Review } from '../../../shared/models/review.model';

@Component({
  selector: 'app-reviews-received',
  template: `
    <div class="page">
      <h1>Reviews Received</h1>
      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      <div class="reviews-list" *ngIf="!loading">
        <mat-card *ngFor="let r of reviews" class="review-card">
          <mat-card-content>
            <div class="review-header">
              <app-star-rating [rating]="r.score" [showValue]="true"></app-star-rating>
              <span class="date">{{ r.created_at | date:'mediumDate' }}</span>
            </div>
            <div class="review-meta">
              <strong>{{ r.service_request?.service?.title || 'Service' }}</strong>
              <span>by {{ r.client?.name || 'Client' }}</span>
            </div>
            <p>{{ r.commentaire || 'No comment.' }}</p>
          </mat-card-content>
        </mat-card>
        <p *ngIf="reviews.length === 0" class="empty">No reviews received yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .reviews-list { display: flex; flex-direction: column; gap: 12px; }
    .review-card { border-radius: 16px !important; }
    .review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .review-header .date { color: #938F99; font-size: 13px; margin-left: auto; }
    .review-card p { color: #64748b; line-height: 1.6; margin: 0; }
    .review-meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .review-meta strong { color: #0f172a; font-size: 15px; }
    .review-meta span { color: #94a3b8; font-size: 13px; }
    .empty { text-align: center; color: #938F99; padding: 32px; }
  `]
})
export class ReviewsReceivedComponent implements OnInit {
  reviews: Review[] = [];
  loading = false;

  constructor(private reviewService: ReviewService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;
    this.loading = true;
    this.reviewService.getReviewsByPrestataire(userId).subscribe({
      next: r => { this.reviews = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
