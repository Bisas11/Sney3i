import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-split">

      <!-- Left: Brand Panel -->
      <div class="brand-panel">
        <a routerLink="/" class="auth-brand-link">
          <img src="assets/logo-white.png" alt="Sney3i" class="auth-logo">
        </a>
        <div class="brand-message">
          <h2>Find trusted professionals, effortlessly.</h2>
          <p>Connect with verified local experts who get the job done right â€” on time, every time.</p>
        </div>
        <div class="brand-footer">
          <p>New here? <a routerLink="/auth/register">Create an account</a></p>
        </div>
      </div>

      <!-- Right: Form Panel -->
      <div class="form-panel">
        <div class="form-box">
          <div class="form-header">
            <h1>Welcome Back</h1>
            <p>Sign in to manage your services</p>
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            <span class="material-symbols-outlined">error</span>
            {{ errorMessage }}
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input type="email" formControlName="email" placeholder="name@example.com" class="form-input">
              </div>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label>Password</label>
                <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
              </div>
              <div class="input-with-icon">
                <span class="material-symbols-outlined input-icon">lock</span>
                <input [type]="hidePassword ? 'password' : 'text'" formControlName="password"
                       placeholder="Enter your password" class="form-input">
                <button type="button" class="toggle-password" (click)="hidePassword = !hidePassword">
                  <span class="material-symbols-outlined">{{ hidePassword ? 'visibility' : 'visibility_off' }}</span>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loginForm.invalid || loading">
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading">Signing in...</span>
            </button>
          </form>

          <p class="bottom-text">
            Don't have an account? <a routerLink="/auth/register">Create one</a>
          </p>
        </div>
      </div>

    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: user => {
        if (user.role === 'admin') this.router.navigate(['/admin']);
        else if (user.role === 'provider' || user.role === 'prestataire') this.router.navigate(['/prestataire/dashboard']);
        else this.router.navigate(['/search']);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.error?.message || 'Invalid email or password';
      }
    });
  }
}
