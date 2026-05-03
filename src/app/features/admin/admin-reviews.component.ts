import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import { Review } from '../../shared/models/review.model';

@Component({
  selector: 'app-admin-reviews',
  template: `
    <div class="page">
      <h1>Review Moderation</h1>
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
          <mat-card-actions align="end">
            <button mat-raised-button color="warn" (click)="delete(r)" [disabled]="processing[r.id]">
              <mat-icon>delete</mat-icon> Delete
            </button>
          </mat-card-actions>
        </mat-card>
        <p *ngIf="reviews.length === 0" class="empty">No reviews found.</p>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size:28px; font-weight:700; color:#0f172a; margin:0 0 20px; }
    .loading { display:flex; justify-content:center; padding:48px; }
    .reviews-list { display:flex; flex-direction:column; gap:12px; }
    .review-card { border-radius:16px !important; }
    .review-header { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
    .date { color:#938F99; font-size:13px; margin-left:auto; }
    .review-meta { display:flex; align-items:baseline; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
    .review-meta strong { color:#0f172a; font-size:15px; }
    .review-meta span { color:#94a3b8; font-size:13px; }
    p { color:#64748b; line-height:1.6; margin:0; }
    .empty { text-align:center; color:#938F99; padding:32px; }
  `]
})
export class AdminReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = false;
  processing: Record<string, boolean> = {};

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminService.getReviews().subscribe({
      next: reviews => { this.reviews = reviews; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  delete(review: Review): void {
    this.processing[review.id] = true;
    this.adminService.deleteReview(review.id, 'Removed by admin moderation').subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== review.id);
        this.snackBar.open('Review deleted.', 'Close', { duration: 3000 });
      },
      error: () => { this.processing[review.id] = false; }
    });
  }
}
