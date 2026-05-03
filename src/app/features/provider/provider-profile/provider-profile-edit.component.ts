import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { environment } from '../../../../environments/environment';
import { ProviderService } from '../../../core/services/provider.service';
import { PrestataireProfile } from '../../../shared/models/provider.model';

@Component({
  selector: 'app-provider-profile-edit',
  styleUrls: ['./provider-profile-edit.component.scss'],
  template: `
    <div class="page">
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
        <span>Loading profile…</span>
      </div>

      <ng-container *ngIf="!loading && user">

        <!-- ── Avatar card ──────────────────────────────────────── -->
        <mat-card class="avatar-card">
          <mat-card-content>
            <div class="profile-card-grid">
              <div class="avatar-section">
                <div class="avatar-wrap">
                  <img *ngIf="imagePreview" [src]="imagePreview" alt="Profile photo" class="avatar-img">
                  <div *ngIf="!imagePreview" class="avatar-placeholder">
                    <mat-icon>person</mat-icon>
                  </div>
                  <label class="avatar-edit-btn" matTooltip="Change photo">
                    <mat-icon>photo_camera</mat-icon>
                    <input type="file" accept="image/*" (change)="onImageSelected($event)" hidden>
                  </label>
                </div>
                <div class="avatar-text">
                  <h2 class="user-name">{{ user.name }}</h2>
                  <p class="user-email"><mat-icon class="inline-icon">mail</mat-icon> {{ user.email }}</p>
                  <p *ngIf="user.created_at" class="user-since">
                    <mat-icon class="inline-icon">calendar_today</mat-icon>
                    Member since {{ user.created_at | date:'MMMM y' }}
                  </p>
                </div>
                <button mat-raised-button color="primary" class="upload-btn"
                        *ngIf="imageFile" [disabled]="savingImage" (click)="saveImage()">
                  <mat-icon>cloud_upload</mat-icon>
                  {{ savingImage ? 'Uploading…' : 'Save Photo' }}
                </button>
              </div>

              <aside class="verification-panel">
                <div class="verification-heading">
                  <mat-icon class="verification-icon" [ngClass]="providerProfile?.application_status">
                    {{ providerProfile?.application_status === 'approved' ? 'verified' : providerProfile?.application_status === 'rejected' ? 'cancel' : 'hourglass_empty' }}
                  </mat-icon>
                  <div>
                    <span class="panel-label">Verification</span>
                    <h3>Provider Status</h3>
                  </div>
                </div>
                <app-status-badge [status]="providerProfile?.application_status || 'pending'"></app-status-badge>
                <p class="verification-note" *ngIf="providerProfile?.application_status === 'approved'">
                  Your profile is visible and trusted across Sney3i.
                </p>
                <p class="verification-note" *ngIf="providerProfile?.application_status === 'pending'">
                  Your documents are being reviewed by the admin team.
                </p>
                <p *ngIf="providerProfile?.rejection_reason" class="rejection-reason">{{ providerProfile?.rejection_reason }}</p>
              </aside>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="section-card">
          <mat-card-header>
            <div mat-card-avatar class="section-icon-wrap"><mat-icon class="section-icon">engineering</mat-icon></div>
            <mat-card-title>Professional Information</mat-card-title>
            <mat-card-subtitle>Update your public title and bio</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="providerForm" (ngSubmit)="saveProviderProfile()">
              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Professional Title</mat-label>
                <mat-icon matPrefix>badge</mat-icon>
                <input matInput formControlName="title" placeholder="Certified Electrician">
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Bio</mat-label>
                <mat-icon matPrefix>notes</mat-icon>
                <textarea matInput formControlName="bio" rows="4"></textarea>
              </mat-form-field>
              <div class="form-footer">
                <button mat-raised-button color="primary" type="submit" [disabled]="savingProvider">
                  <mat-icon>save</mat-icon>
                  {{ savingProvider ? 'Saving…' : 'Save Professional Info' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card class="section-card">
          <mat-card-header>
            <div mat-card-avatar class="section-icon-wrap"><mat-icon class="section-icon">edit</mat-icon></div>
            <mat-card-title>Personal Information</mat-card-title>
            <mat-card-subtitle>Update your name, phone and address</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Full Name</mat-label>
                  <mat-icon matPrefix>person_outline</mat-icon>
                  <input matInput formControlName="name" placeholder="Your full name">
                  <mat-error *ngIf="profileForm.get('name')?.hasError('required')">Name is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone Number</mat-label>
                  <mat-icon matPrefix>phone</mat-icon>
                  <input matInput formControlName="phone_number" placeholder="+21600000000">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-field">
                  <mat-label>Address</mat-label>
                  <mat-icon matPrefix>location_on</mat-icon>
                  <input matInput formControlName="address" placeholder="City, Region">
                </mat-form-field>
              </div>
              <div class="form-footer">
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="profileForm.invalid || savingProfile">
                  <mat-icon>save</mat-icon>
                  {{ savingProfile ? 'Saving…' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- ── Password ──────────────────────────────────────────── -->
        <mat-card class="section-card">
          <mat-card-header>
            <div mat-card-avatar class="section-icon-wrap"><mat-icon class="section-icon">lock</mat-icon></div>
            <mat-card-title>Change Password</mat-card-title>
            <mat-card-subtitle>Choose a strong password of at least 6 characters</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="passwordForm" (ngSubmit)="savePassword()">
              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Current Password</mat-label>
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput type="password" formControlName="current_password">
                <mat-error *ngIf="passwordForm.get('current_password')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>New Password</mat-label>
                  <mat-icon matPrefix>lock_reset</mat-icon>
                  <input matInput type="password" formControlName="new_password" placeholder="Min. 6 characters">
                  <mat-error *ngIf="passwordForm.get('new_password')?.hasError('minlength')">Minimum 6 characters</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Confirm New Password</mat-label>
                  <mat-icon matPrefix>lock_reset</mat-icon>
                  <input matInput type="password" formControlName="confirm_password">
                </mat-form-field>
              </div>
              <p class="mismatch-error"
                 *ngIf="passwordForm.errors?.['mismatch'] && passwordForm.get('confirm_password')?.touched">
                Passwords do not match.
              </p>
              <div class="form-footer">
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="passwordForm.invalid || savingPassword">
                  <mat-icon>lock</mat-icon>
                  {{ savingPassword ? 'Updating…' : 'Update Password' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

      </ng-container>
    </div>
  `
})
export class ProviderProfileEditComponent implements OnInit {
  user: User | null = null;
  loading = true;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  providerProfile: PrestataireProfile | null = null;
  savingProfile = false;
  savingImage = false;
  savingPassword = false;
  savingProvider = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;
  providerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private providerService: ProviderService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone_number: [''],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.providerForm = this.fb.group({
      title: [''],
      bio: ['']
    });
  }

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const np = g.get('new_password')?.value;
    const cp = g.get('confirm_password')?.value;
    return np && cp && np !== cp ? { mismatch: true } : null;
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.profileForm.patchValue({
          name: user.name || '',
          phone_number: user.phone_number || '',
          address: user.address || ''
        });
        if (user.image_url) {
          this.imagePreview = user.image_url.startsWith('http')
            ? user.image_url
            : `${environment.apiUrl}${user.image_url.startsWith('/uploads/') ? user.image_url : '/uploads/' + user.image_url}`;
        }
        this.loadProviderProfile();
      },
      error: () => { this.loading = false; }
    });
  }

  loadProviderProfile(): void {
    this.providerService.getMyProfile().subscribe({
      next: profile => {
        this.providerProfile = profile;
        this.providerForm.patchValue({
          title: profile.title || '',
          bio: profile.bio || ''
        });
      }
    });
  }

  saveProviderProfile(): void {
    this.savingProvider = true;
    this.providerService.updateMyProfile(this.providerForm.value).subscribe({
      next: profile => {
        this.providerProfile = profile;
        this.savingProvider = false;
        this.snackBar.open('Professional profile updated!', 'Close', { duration: 3000 });
      },
      error: err => {
        this.savingProvider = false;
        this.snackBar.open(err?.error?.error?.message || 'Professional profile update failed', 'Close', { duration: 4000 });
      }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = e => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  saveImage(): void {
    if (!this.imageFile) return;
    this.savingImage = true;
    this.authService.updateImage(this.imageFile).subscribe({
      next: () => {
        this.savingImage = false;
        this.imageFile = null;
        this.snackBar.open('Photo updated!', 'Close', { duration: 3000 });
      },
      error: () => { this.savingImage = false; }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile = true;
    const { name, phone_number, address } = this.profileForm.value;
    this.authService.updateProfile({ name, phone_number, address }).subscribe({
      next: () => {
        this.savingProfile = false;
        this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
      },
      error: () => { this.savingProfile = false; }
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword = true;
    const { current_password, new_password } = this.passwordForm.value;
    this.authService.updatePassword(current_password, new_password).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordForm.reset();
        this.snackBar.open('Password updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.savingPassword = false;
        this.snackBar.open(err?.error?.message || 'Password update failed', 'Close', { duration: 4000 });
      }
    });
  }
}

