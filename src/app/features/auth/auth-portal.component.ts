import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-portal',
  template: `
    <div class="auth-split">
      <div class="brand-panel">
        <a routerLink="/" class="auth-brand-link">
          <img src="assets/logo-white.png" alt="Sney3i" class="auth-logo">
        </a>
        <div class="brand-message">
          <h2>Find trusted professionals, effortlessly.</h2>
          <p>Join Sney3i to request services or offer your skills to local clients.</p>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-box">
          <mat-tab-group [(selectedIndex)]="selectedTab">
            <mat-tab label="Login">
              <div class="tab-inner">
                <div class="form-header">
                  <h1>Welcome Back</h1>
                  <p>Sign in to continue</p>
                </div>

                <div *ngIf="loginError" class="error-banner">
                  <span class="material-symbols-outlined">error</span>
                  {{ loginError }}
                </div>

                <form [formGroup]="loginForm" (ngSubmit)="login()">
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
                      <input type="password" formControlName="password" placeholder="Enter your password" class="form-input">
                    </div>
                  </div>
                  <button type="submit" class="btn-submit" [disabled]="loginForm.invalid || loginLoading">
                    {{ loginLoading ? 'Signing in...' : 'Sign In' }}
                  </button>
                </form>
              </div>
            </mat-tab>

            <mat-tab label="Sign Up">
              <div class="tab-inner">
                <div class="form-header">
                  <h1>Create Account</h1>
                  <p>We will send a verification email</p>
                </div>

                <div *ngIf="registerSuccess" class="success-banner">
                  <span class="material-symbols-outlined">mark_email_read</span>
                  <div>
                    <strong>Check your inbox!</strong>
                    <p>We sent a verification email to <strong>{{ registeredEmail }}</strong>.</p>
                  </div>
                </div>

                <div *ngIf="registerError" class="error-banner">
                  <span class="material-symbols-outlined">error</span>
                  {{ registerError }}
                </div>

                <form *ngIf="!registerSuccess" [formGroup]="registerForm" (ngSubmit)="register()">
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
                  <div class="form-group">
                    <label>Password</label>
                    <div class="input-with-icon">
                      <span class="material-symbols-outlined input-icon">lock</span>
                      <input type="password" formControlName="password" placeholder="At least 6 characters" class="form-input">
                    </div>
                  </div>
                  <button type="submit" class="btn-submit" [disabled]="registerForm.invalid || registerLoading">
                    {{ registerLoading ? 'Creating...' : 'Create Account' }}
                  </button>
                </form>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login/login.component.scss'],
  styles: [`
    :host ::ng-deep .mat-mdc-tab-body-content { overflow: visible; }
    .tab-inner { padding-top: 28px; }
  `]
})
export class AuthPortalComponent {
  selectedTab = 0;
  loginLoading = false;
  registerLoading = false;
  registerSuccess = false;
  loginError = '';
  registerError = '';
  registeredEmail = '';

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.loginForm.invalid || this.loginLoading) return;
    this.loginLoading = true;
    this.loginError = '';
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: user => {
        if (user.role === 'admin') this.router.navigate(['/admin']);
        else if (user.role === 'provider' || user.role === 'prestataire') this.router.navigate(['/prestataire/dashboard']);
        else this.router.navigate(['/search']);
      },
      error: err => {
        this.loginLoading = false;
        this.loginError = err?.error?.error?.message || 'Invalid email or password';
      }
    });
  }

  register(): void {
    if (this.registerForm.invalid || this.registerLoading) return;
    this.registerLoading = true;
    this.registerError = '';
    const { name, email, password } = this.registerForm.value;
    this.auth.register(name, email, password).subscribe({
      next: res => {
        this.registerLoading = false;
        this.registerSuccess = true;
        this.registeredEmail = res.email;
      },
      error: err => {
        this.registerLoading = false;
        this.registerError = err?.error?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
