import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  styleUrls: ['./reset-password.component.scss'],
  template: `
    <div class="auth-split">
      <div class="brand-panel">
        <a routerLink="/" class="auth-brand-link">
          <img src="assets/logo-white.png" alt="Sney3i" class="auth-logo">
        </a>
        <div class="brand-message">
          <h2>Choose a new password</h2>
          <p>Make it strong and memorable.</p>
        </div>
        <div class="brand-footer">
          <p>Remembered? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-box">

          <ng-container *ngIf="!token">
            <div class="state-box">
              <span class="material-symbols-outlined state-icon" style="color:#dc2626">link_off</span>
              <strong>Invalid Link</strong>
              <p>This reset link is missing a token. Please request a new one.</p>
              <a routerLink="/auth/forgot-password" class="btn-submit">Request Reset Link</a>
            </div>
          </ng-container>

          <ng-container *ngIf="token && success">
            <div class="state-box">
              <span class="material-symbols-outlined state-icon" style="color:#16a34a">lock_reset</span>
              <strong>Password Updated!</strong>
              <p>Your password has been changed. Redirecting you to sign in...</p>
              <a routerLink="/auth/login" class="btn-submit">Go to Sign In</a>
            </div>
          </ng-container>

          <ng-container *ngIf="token && !success">
            <div class="form-header">
              <h1>Reset Password</h1>
              <p>Enter your new password below</p>
            </div>

            <div *ngIf="errorMessage" class="error-banner">
              <span class="material-symbols-outlined">error</span>
              {{ errorMessage }}
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label>New Password</label>
                <div class="input-with-icon">
                  <span class="material-symbols-outlined input-icon">lock</span>
                  <input [type]="hidePassword ? 'password' : 'text'" formControlName="password"
                         placeholder="At least 6 characters" class="form-input">
                  <button type="button" class="toggle-password" (click)="hidePassword = !hidePassword">
                    <span class="material-symbols-outlined">{{ hidePassword ? 'visibility' : 'visibility_off' }}</span>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Confirm Password</label>
                <div class="input-with-icon">
                  <span class="material-symbols-outlined input-icon">lock_reset</span>
                  <input [type]="hideConfirm ? 'password' : 'text'" formControlName="confirmPassword"
                         placeholder="Repeat your password" class="form-input">
                  <button type="button" class="toggle-password" (click)="hideConfirm = !hideConfirm">
                    <span class="material-symbols-outlined">{{ hideConfirm ? 'visibility' : 'visibility_off' }}</span>
                  </button>
                </div>
              </div>

              <div *ngIf="form.errors?.['mismatch'] && form.get('confirmPassword')?.touched" class="error-banner">
                <span class="material-symbols-outlined">error</span>
                Passwords do not match.
              </div>

              <button type="submit" class="btn-submit" [disabled]="form.invalid || loading">
                <span *ngIf="!loading">Update Password</span>
                <span *ngIf="loading">Updating...</span>
              </button>
            </form>

            <p class="bottom-text">
              <a routerLink="/auth/login">Back to Sign In</a>
            </p>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  hideConfirm = true;
  loading = false;
  success = false;
  errorMessage = '';
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  private passwordMatchValidator(group: FormGroup): { mismatch: true } | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.resetPassword(this.token, this.form.value.password).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/auth/login']), 2500);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.error?.message || 'Reset failed. The link may have expired.';
      }
    });
  }
}
