import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  styleUrls: ['./verify-email.component.scss'],
  template: `
    <div class="auth-split">
      <div class="brand-panel">
        <a routerLink="/" class="auth-brand-link">
          <img src="assets/logo-white.png" alt="Sney3i" class="auth-logo">
        </a>
        <div class="brand-message">
          <h2>Verify your email</h2>
          <p>One last step before you can start using Sney3i.</p>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-box">

          <ng-container *ngIf="loading">
            <div class="state-box">
              <span class="material-symbols-outlined state-icon spin" style="color:#076ab8">progress_activity</span>
              <strong>Verifying your email…</strong>
              <p>Please wait while we confirm your account.</p>
            </div>
          </ng-container>

          <ng-container *ngIf="!loading && success">
            <div class="state-box">
              <span class="material-symbols-outlined state-icon" style="color:#16a34a">verified</span>
              <strong>Email verified!</strong>
              <p>Your account is now active. Redirecting you to complete your profile...</p>
              <a routerLink="/profile" class="btn-link">Go to Profile</a>
            </div>
          </ng-container>

          <ng-container *ngIf="!loading && !success">
            <div class="state-box">
              <span class="material-symbols-outlined state-icon" style="color:#dc2626">cancel</span>
              <strong>Verification failed</strong>
              <p>{{ errorMessage }}</p>
              <a routerLink="/auth/register" class="btn-link">Back to Register</a>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading = false;
      this.errorMessage = 'Invalid or missing verification token.';
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/profile']), 1200);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.error?.message || 'The link is invalid or has expired.';
      }
    });
  }
}
