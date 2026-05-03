import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-client-profile',
  styleUrls: ['./client-profile.component.scss'],
  template: `
    <div class="page">
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
        <span>Loading profile…</span>
      </div>

      <ng-container *ngIf="!loading && user">

        <!-- ── Avatar card ─────────────────────────────────────── -->
        <mat-card class="avatar-card">
          <mat-card-content>
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
          </mat-card-content>
        </mat-card>

        <!-- ── Personal info ────────────────────────────────────── -->
        <mat-card class="section-card">
          <mat-card-header>
            <div mat-card-avatar class="section-icon-wrap"><mat-icon class="section-icon">verified</mat-icon></div>
            <mat-card-title>Apply to become a Provider</mat-card-title>
            <mat-card-subtitle>Submit your professional info and documents for review</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="application-row">
              <div>
                <app-status-badge *ngIf="user.prestataire_application" [status]="user.prestataire_application.status"></app-status-badge>
                <p *ngIf="!user.prestataire_application">You have not submitted an application yet.</p>
                <p *ngIf="user.prestataire_application?.rejection_reason" class="mismatch-error">
                  {{ user.prestataire_application?.rejection_reason }}
                </p>
              </div>
              <button mat-raised-button color="primary" routerLink="/client/upgrade"
                      [disabled]="user.prestataire_application?.status === 'approved' || user.prestataire_application?.status === 'pending'">
                <mat-icon>upload_file</mat-icon>
                Apply
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="section-card">
          <mat-card-header>
            <div mat-card-avatar class="section-icon-wrap"><mat-icon class="section-icon">edit</mat-icon></div>
            <mat-card-title>Personal Information</mat-card-title>
            <mat-card-subtitle>Update your name, phone, address and birthday</mat-card-subtitle>
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

                <mat-form-field appearance="outline">
                  <mat-label>Address</mat-label>
                  <mat-icon matPrefix>location_on</mat-icon>
                  <input matInput formControlName="address" placeholder="City, Region">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date of Birth</mat-label>
                  <mat-icon matPrefix>cake</mat-icon>
                  <input matInput [matDatepicker]="dob" formControlName="date_of_birth" placeholder="DD/MM/YYYY" readonly>
                  <mat-datepicker-toggle matIconSuffix [for]="dob"></mat-datepicker-toggle>
                  <mat-datepicker #dob startView="multi-year"></mat-datepicker>
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

        <!-- ── Password ─────────────────────────────────────────── -->
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
export class ClientProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  savingProfile = false;
  savingImage = false;
  savingPassword = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone_number: [''],
      address: [''],
      date_of_birth: ['']
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.profileForm.patchValue({
          name: user.name || '',
          phone_number: user.phone_number || '',
          address: user.address || '',
          date_of_birth: user.date_of_birth || ''
        });
        if (user.image_url) {
          this.imagePreview = user.image_url.startsWith('http')
            ? user.image_url
            : `${environment.apiUrl}${user.image_url.startsWith('/uploads/') ? user.image_url : '/uploads/' + user.image_url}`;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  saveImage(): void {
    if (!this.imageFile) return;
    this.savingImage = true;
    this.authService.updateImage(this.imageFile).subscribe({
      next: (user) => {
        this.user = user;
        this.imageFile = null;
        this.savingImage = false;
        this.snackBar.open('Profile photo updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.savingImage = false;
        this.snackBar.open(err?.error?.error?.message || 'Failed to upload image', 'Close', { duration: 3000 });
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile = true;
    const raw = this.profileForm.value;
    const payload: any = { name: raw.name };
    if (raw.phone_number) payload.phone_number = raw.phone_number;
    if (raw.address) payload.address = raw.address;
    if (raw.date_of_birth) {
      // MatDatepicker returns a Date object — convert to ISO date string YYYY-MM-DD
      const d: Date | string = raw.date_of_birth;
      payload.date_of_birth = d instanceof Date
        ? d.toISOString().split('T')[0]
        : d;
    }

    this.authService.updateProfile(payload).subscribe({
      next: (user) => {
        this.user = user;
        this.savingProfile = false;
        this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.savingProfile = false;
        this.snackBar.open(err?.error?.error?.message || 'Failed to save profile', 'Close', { duration: 3000 });
      }
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
        this.snackBar.open(err?.error?.error?.message || 'Failed to update password', 'Close', { duration: 3000 });
      }
    });
  }

  private passwordMatchValidator(group: FormGroup): { mismatch: true } | null {
    const pw = group.get('new_password')?.value;
    const confirm = group.get('confirm_password')?.value;
    return pw === confirm ? null : { mismatch: true };
  }
}
