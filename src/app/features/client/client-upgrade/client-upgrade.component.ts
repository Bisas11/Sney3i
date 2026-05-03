import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ProviderService } from '../../../core/services/provider.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-upgrade',
  template: `
    <div class="page">
      <h1>Upgrade to Provider</h1>
      <p class="subtitle">Submit your documents to become a verified service provider.</p>

      <div *ngIf="loading" style="display:flex;align-items:center;gap:12px;padding:32px;color:#64748b">
        <mat-spinner diameter="32"></mat-spinner><span>Loading status…</span>
      </div>

      <mat-card class="status-card" *ngIf="!loading">
        <mat-card-content>
          <div class="status-row">
            <mat-icon class="status-icon" [ngClass]="appStatus">
              {{ appStatus === 'approved' ? 'verified' : appStatus === 'rejected' ? 'cancel' : appStatus === 'pending' ? 'hourglass_empty' : 'upload_file' }}
            </mat-icon>
            <div>
              <h2>Status: <span [ngClass]="appStatus">{{ appStatus === 'none' ? 'Not Submitted' : (appStatus | titlecase) }}</span></h2>
              <p *ngIf="appStatus === 'none'">Upload your ID and certificates to start the verification process.</p>
              <p *ngIf="appStatus === 'pending'">Your documents are being reviewed. This usually takes 1-3 business days.</p>
              <p *ngIf="appStatus === 'approved'">Congratulations! Your account has been upgraded to Provider.</p>
              <p *ngIf="appStatus === 'rejected'">Your verification was rejected.<br>
                <em *ngIf="rejectionReason">Reason: {{ rejectionReason }}</em>
              </p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="upload-card" *ngIf="!loading && (appStatus === 'none' || appStatus === 'rejected')">
        <mat-card-header>
          <mat-card-title>Upload Documents</mat-card-title>
          <mat-card-subtitle>Fill in your professional info and upload supporting documents.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="form-group">
            <label>Professional Title *</label>
            <input type="text" [(ngModel)]="title" placeholder="e.g. Certified Electrician" class="form-input">
          </div>
          <div class="form-group">
            <label>Bio *</label>
            <textarea [(ngModel)]="bio" placeholder="Describe your experience and specialties..." rows="3" class="form-input"></textarea>
          </div>
          <label class="modern-upload">
            <span class="upload-icon"><mat-icon>cloud_upload</mat-icon></span>
            <span class="upload-copy">
              <strong>{{ selectedFiles.length ? selectedFiles.length + ' document(s) selected' : 'Upload verification documents' }}</strong>
              <span>ID, diploma, certificate or PDF files. Multiple files are supported.</span>
            </span>
            <span class="upload-action">
              <mat-icon>attach_file</mat-icon>
              Browse
            </span>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" (change)="onFilesSelected($event)">
          </label>
          <div class="documents-list" *ngIf="selectedFiles.length > 0">
            <div class="doc-item" *ngFor="let f of selectedFiles; let i = index">
              <mat-icon>description</mat-icon>
              <span>{{ f.name }}</span>
              <mat-select [(ngModel)]="docTypes[i]" placeholder="Document type" style="width:160px">
                <mat-option value="id_card">ID Card</mat-option>
                <mat-option value="diploma">Diploma</mat-option>
                <mat-option value="certificate">Certificate</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-raised-button color="primary"
                  [disabled]="!title || !bio || selectedFiles.length === 0 || submitting"
                  (click)="submitForReview()">
            {{ submitting ? 'Submitting...' : 'Submit for Review' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .subtitle { color: #64748b; margin-bottom: 24px; }
    .status-card, .upload-card { border-radius: 16px !important; margin-bottom: 24px; }
    .status-row { display: flex; align-items: center; gap: 16px; }
    .status-icon { font-size: 48px; width: 48px; height: 48px; }
    .status-icon.none { color: #64748b; } .status-icon.pending, .pending { color: #FF8F00; }
    .status-icon.approved, .approved { color: #00C853; } .status-icon.rejected, .rejected { color: #D50000; }
    h2 { font-size: 20px; margin: 0 0 8px; color: #0f172a; } h2 span { font-weight: 600; }
    .form-group { margin-bottom: 16px; } .form-group label { display: block; font-weight: 500; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .modern-upload { margin-bottom: 16px; }
    .documents-list { display: flex; flex-direction: column; gap: 10px; }
    .doc-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #dbeafe; border-radius: 12px; background: #f8fbff; }
    .doc-item span { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `]
})
export class ClientUpgradeComponent implements OnInit {
  appStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';
  rejectionReason = '';
  loading = true;
  title = '';
  bio = '';
  selectedFiles: File[] = [];
  docTypes: string[] = [];
  submitting = false;

  constructor(
    private auth: AuthService,
    private providerService: ProviderService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe(user => {
      const app = user.prestataire_application;
      if (app) {
        this.appStatus = app.status;
        this.rejectionReason = app.rejection_reason || '';
        if (this.appStatus === 'approved') {
          this.router.navigate(['/prestataire/dashboard']);
        }
      }
      this.loading = false;
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.selectedFiles.push(input.files[i]);
        this.docTypes.push('id_card');
      }
    }
  }

  submitForReview(): void {
    if (!this.title || !this.bio || this.selectedFiles.length === 0 || this.submitting) return;
    this.submitting = true;
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('bio', this.bio);
    this.selectedFiles.forEach((file, i) => {
      formData.append('documents', file);
      formData.append('doc_types', this.docTypes[i] || 'other');
    });
    this.providerService.applyAsPrestataire(formData).subscribe({
      next: () => {
        this.submitting = false;
        this.appStatus = 'pending';
        this.snackBar.open('Documents submitted for review!', 'Close', { duration: 3000 });
      },
      error: err => {
        this.submitting = false;
        this.snackBar.open(err?.error?.error?.message || 'Submission failed', 'Close', { duration: 4000 });
      }
    });
  }
}
