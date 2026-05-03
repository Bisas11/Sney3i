import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-split">

      <!-- Left: Brand Panel -->
      <div class="brand-panel">
        <a routerLink="/" class="auth-brand-link">
          <img src="assets/logo-white.png" alt="Sney3i" class="auth-logo">
        </a>
        <div class="brand-message">
          <h2>Start your journey with us today.</h2>
          <p>Whether you're looking for a pro or ready to offer your skills â€” Sney3i is the place to be.</p>
        </div>
        <div class="brand-footer">
          <p>Have an account? <a routerLink="/auth/login">Sign in instead</a></p>
        </div>
      </div>

      <!-- Right: Form Panel -->
      <div class="form-panel">
        <div class="form-box">
          <div class="form-header">
            <h1>Create Account</h1>
            <p>Join Sney3i in just a few steps</p>
          </div>

          <!-- Success state -->
          <div *ngIf="success" class="success-banner">
            <span class="material-symbols-outlined">mark_email_read</span>
            <div>
              <strong>Check your inbox!</strong>
              <p>We sent a verification email to <strong>{{ registeredEmail }}</strong>. Please verify your email before signing in.</p>
            </div>
          </div>

          <!-- Error state -->
          <div *ngIf="errorMessage" class="error-banner">
            <span class="material-symbols-outlined">error</span>
            {{ errorMessage }}
          </div>

          <form *ngIf="!success" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Full Name</label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined input-icon">badge</span>
                <input type="text" formControlName="name" placeholder="John Doe" class="form-input">
              </div>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input type="email" formControlName="email" placeholder="john@example.com" class="form-input">
              </div>
            </div>

            <div class="password-row">
              <div class="form-group">
                <label>Password</label>
                <div class="input-with-icon">
                  <span class="material-symbols-outlined input-icon">lock</span>
                  <input [type]="hidePassword ? 'password' : 'text'" formControlName="password"
                         placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" class="form-input">
                </div>
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <div class="input-with-icon">
                  <span class="material-symbols-outlined input-icon">lock_reset</span>
                  <input [type]="hideConfirm ? 'password' : 'text'" formControlName="confirmPassword"
                         placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" class="form-input">
                </div>
              </div>
            </div>

            <div class="terms-row">
              <input type="checkbox" id="terms">
              <label for="terms">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </label>
            </div>

            <button type="submit" class="btn-submit" [disabled]="registerForm.invalid || loading">
              <span *ngIf="!loading">Create Account</span>
              <span *ngIf="loading">Creating...</span>
              <span class="material-symbols-outlined" *ngIf="!loading">arrow_forward</span>
            </button>
          </form>

          <p *ngIf="!success" class="bottom-text">
            Already have an account? <a routerLink="/auth/login">Sign in</a>
          </p>
          <p *ngIf="success" class="bottom-text">
            <a routerLink="/auth/login">Go to Sign In</a>
          </p>
        </div>
      </div>

    </div>
  `,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirm = true;
  loading = false;
  success = false;
  errorMessage = '';
  registeredEmail = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.loading) return;
    const { name, email, password } = this.registerForm.value;
    this.loading = true;
    this.errorMessage = '';
    this.auth.register(name, email, password).subscribe({
      next: res => {
        this.loading = false;
        this.success = true;
        this.registeredEmail = res.email;
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
