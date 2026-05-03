import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="auth-split">
      <div class="brand-panel">
        <a routerLink="/" class="auth-brand-link">
          <img src="assets/logo-white.png" alt="Sney3i" class="auth-logo">
        </a>
        <div class="brand-message">
          <h2>Reset your password</h2>
          <p>Enter your email and we'll send you a reset link.</p>
        </div>
        <div class="brand-footer">
          <p>Remembered? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-box">
          <div class="form-header">
            <h1>Forgot Password</h1>
            <p>We'll send a reset link to your inbox</p>
          </div>

          <div *ngIf="sent" class="success-banner">
            <span class="material-symbols-outlined">mark_email_read</span>
            <div>
              <strong>Reset link sent!</strong>
              <p>If an account with that email exists, you'll receive a reset link shortly.</p>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            <span class="material-symbols-outlined">error</span>
            {{ errorMessage }}
          </div>

          <form *ngIf="!sent" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input type="email" formControlName="email" placeholder="name@example.com" class="form-input">
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="form.invalid || loading">
              <span *ngIf="!loading">Send Reset Link</span>
              <span *ngIf="loading">Sending...</span>
            </button>
          </form>

          <p class="bottom-text">
            <a routerLink="/auth/login">Back to Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  sent = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.sent = true;
      },
      error: () => {
        this.loading = false;
        this.sent = true; // Always show "sent" to prevent email enumeration
      }
    });
  }
}
