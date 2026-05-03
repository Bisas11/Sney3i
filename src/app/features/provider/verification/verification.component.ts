import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verification',
  template: `
    <div class="page">
      <h1>Account Verification</h1>

      <mat-card class="status-card" *ngIf="applicationStatus !== 'none'">
        <mat-card-content>
          <div class="status-row">
            <mat-icon class="status-icon" [ngClass]="applicationStatus">
              {{ applicationStatus === 'approved' ? 'verified' : applicationStatus === 'rejected' ? 'cancel' : 'hourglass_empty' }}
            </mat-icon>
            <div>
              <h2>Status: <span [ngClass]="applicationStatus">{{ applicationStatus | titlecase }}</span></h2>
              <p *ngIf="applicationStatus === 'pending'">Your documents are being reviewed. This usually takes 1-3 business days.</p>
              <p *ngIf="applicationStatus === 'approved'">Your account is verified! Clients can now find you in search results.</p>
              <p *ngIf="applicationStatus === 'rejected'">
                Your verification was rejected.
                <span *ngIf="rejectionReason"> Reason: {{ rejectionReason }}</span>
                Please re-submit via the Upgrade page.
              </p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="info-card" *ngIf="applicationStatus === 'none'">
        <mat-card-content>
          <p>You have not submitted a provider application yet. Go to the <strong>Become a Provider</strong> page to apply.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
    .status-card, .info-card { border-radius: 16px !important; margin-bottom: 24px; }
    .status-row { display: flex; align-items: center; gap: 16px; }
    .status-icon { font-size: 48px; width: 48px; height: 48px; }
    .status-icon.pending, .pending { color: #FF8F00; }
    .status-icon.approved, .approved { color: #00C853; }
    .status-icon.rejected, .rejected { color: #D50000; }
    h2 { font-size: 20px; margin: 0 0 8px; color: #0f172a; }
    h2 span { font-weight: 600; }
    .status-row p { color: #64748b; margin: 0; }
  `]
})
export class VerificationComponent implements OnInit {
  applicationStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';
  rejectionReason: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user?.prestataire_application) {
      this.applicationStatus = user.prestataire_application.status;
      this.rejectionReason = user.prestataire_application.rejection_reason ?? null;
    }
  }
}
