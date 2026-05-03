import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from '../../../core/services/service.service';
import { RequestService } from '../../../core/services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { ServiceDetailFull, ServiceReview } from '../../../shared/models/service.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SendRequestDialogComponent, SendRequestDialogData } from '../../../shared/components/send-request-dialog/send-request-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-provider-profile',
  template: `
    <div class="profile-page" *ngIf="detail">
      <div class="profile-header">
        <div class="profile-avatar">
          <img *ngIf="detail.service.image_url"
               [src]="getImageSrc(detail.service.image_url)"
               [alt]="detail.service.title" style="width:100%;height:100%;object-fit:cover;border-radius:50%">
          <mat-icon *ngIf="!detail.service.image_url" style="font-size:64px">home_repair_service</mat-icon>
        </div>
        <div class="profile-info">
          <h1>{{ detail.service.title }}</h1>
          <p class="profession">by {{ detail.prestataire.name }}</p>
          <div class="meta">
            <app-star-rating [rating]="detail.review_summary.average_score"></app-star-rating>
            <span>({{ detail.review_summary.total }} reviews)</span>
            <span class="divider">|</span>
            <strong style="color:#1976d2">{{ detail.service.price }} DT</strong>
          </div>
        </div>
        <div class="profile-actions">
          <ng-container *ngIf="auth.isLoggedIn">
            <button mat-raised-button color="primary" class="send-request-btn"
                    (click)="sendRequest()" [disabled]="!canSendRequest">
              <mat-icon>send</mat-icon> Send Service Request
            </button>
            <span class="request-hint" *ngIf="!canSendRequest && blockReason">{{ blockReason }}</span>
          </ng-container>
          <ng-container *ngIf="!auth.isLoggedIn">
            <button mat-raised-button color="primary" routerLink="/auth" class="login-to-request">
              <mat-icon>login</mat-icon> Login to send request
            </button>
          </ng-container>
        </div>
      </div>

      <div class="profile-body">
        <mat-tab-group>
          <!-- About Service -->
          <mat-tab label="About">
            <div class="tab-content">
              <h3>Service Description</h3>
              <p>{{ detail.service.description }}</p>
              <div class="info-grid" *ngIf="detail.prestataire.address">
                <div class="info-item">
                  <mat-icon>location_on</mat-icon>
                  <div>
                    <strong>Location</strong>
                    <p>{{ detail.prestataire.address }}</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Reviews -->
          <mat-tab label="Reviews ({{ detail.review_summary.total }})">
            <div class="tab-content">
              <div *ngFor="let review of reviews" class="review-item">
                <div class="review-header">
                  <strong>{{ review.client.name }}</strong>
                  <app-star-rating [rating]="review.score" [showValue]="false"></app-star-rating>
                  <span class="review-date">{{ review.created_at | date:'mediumDate' }}</span>
                </div>
                <p>{{ review.commentaire }}</p>
                <mat-divider></mat-divider>
              </div>
              <p *ngIf="reviews.length === 0" class="empty">No reviews yet.</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <div *ngIf="!detail && !loading" class="no-results" style="padding:80px;text-align:center">
      <mat-icon style="font-size:48px">error_outline</mat-icon>
      <h3>Service not found</h3>
    </div>
    <div *ngIf="loading" style="padding:80px;text-align:center">
      <mat-spinner diameter="40" style="margin:auto"></mat-spinner>
    </div>
  `,
  styleUrls: ['./provider-profile.component.scss']
})
export class ProviderProfileComponent implements OnInit {
  detail?: ServiceDetailFull;
  reviews: ServiceReview[] = [];
  loading = true;
  readonly apiUrl = environment.apiUrl;
  isOwnService = false;
  hasActiveRequest = false;
  checkingEligibility = false;
  blockReason = '';

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceService,
    private requestService: RequestService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.serviceService.getServiceById(id, { page: 1 }).subscribe({
      next: res => {
        if (!('service' in res)) {
          this.loading = false;
          return;
        }
        this.detail = res;
        this.reviews = res.reviews;
        this.loading = false;
        this.evaluateEligibility();
      },
      error: () => this.loading = false
    });
  }

  get canSendRequest(): boolean {
    if (!this.auth.isLoggedIn) return false;
    if (this.checkingEligibility) return false;
    return !this.isOwnService && !this.hasActiveRequest;
  }

  getImageSrc(url: string | null | undefined): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${this.apiUrl}${url.startsWith('/uploads/') ? url : '/uploads/' + url}`;
  }

  sendRequest(): void {
    if (!this.canSendRequest) return;
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/auth']);
      return;
    }

    const dialogRef = this.dialog.open(SendRequestDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: {
        service_id: this.detail!.service.id,
        serviceTitle: this.detail!.service.title,
        prestataireNom: this.detail!.prestataire.name
      } as SendRequestDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result !== null) {
        this.requestService.createRequest(
          this.detail!.service.id,
          result.client_message || undefined
        ).subscribe({
          next: () => {
            this.hasActiveRequest = true;
            this.blockReason = 'You already have an active request for this service.';
            this.snackBar.open('Request sent successfully!', 'Close', { duration: 3000 });
          },
          error: err => this.snackBar.open(
            err?.error?.error?.message || 'Failed to send request',
            'Close', { duration: 4000 }
          )
        });
      }
    });
  }

  private evaluateEligibility(): void {
    this.isOwnService = false;
    this.hasActiveRequest = false;
    this.blockReason = '';

    const user = this.auth.currentUser;
    if (!user || !this.detail) return;

    if (user.id === this.detail.prestataire.id) {
      this.isOwnService = true;
      this.blockReason = 'You cannot request your own service.';
      return;
    }

    this.checkingEligibility = true;
    this.blockReason = 'Checking request status...';
    this.requestService.getClientHistory().subscribe({
      next: reqs => {
        this.hasActiveRequest = reqs.some(r =>
          r.service?.id === this.detail!.service.id &&
          ['pending', 'accepted', 'in_progress'].includes(r.status)
        );
        this.blockReason = this.hasActiveRequest
          ? 'You already have an active request for this service.'
          : '';
        this.checkingEligibility = false;
      },
      error: () => {
        this.checkingEligibility = false;
        this.blockReason = '';
      }
    });
  }
}
