import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { PrestataireProfile } from '../../../shared/models/provider.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-provider-validation',
  template: `
    <div class="page">
      <h1>Provider Validation</h1>
      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      <div class="providers-list" *ngIf="!loading">
        <mat-card *ngFor="let p of pendingProviders" class="provider-card">
          <mat-card-content>
            <div class="provider-row">
              <div class="provider-info">
                <img *ngIf="p.user?.image_url" [src]="getImageSrc(p.user?.image_url)" class="avatar-img" alt="Avatar">
                <mat-icon *ngIf="!p.user?.image_url" class="avatar-icon">account_circle</mat-icon>
                <div>
                  <h3>{{ p.user?.name || 'Unknown' }}</h3>
                  <p>{{ p.title || 'No title' }}</p>
                  <p class="bio">{{ p.bio || 'No bio provided.' }}</p>
                </div>
              </div>
              <div class="documents" *ngIf="p.documents?.length">
                <h4>Documents ({{ p.documents!.length }})</h4>
                <div class="doc-item" *ngFor="let doc of p.documents">
                  <mat-icon>description</mat-icon>
                  <span>{{ doc.doc_type | titlecase }}</span>
                  <a [href]="getDocUrl(doc.doc_url)" target="_blank" mat-icon-button matTooltip="View">
                    <mat-icon>visibility</mat-icon>
                  </a>
                </div>
              </div>
              <div class="actions">
                <button mat-raised-button color="primary" (click)="approve(p)" [disabled]="processing[p.id]">
                  <mat-icon>check</mat-icon> Approve
                </button>
                <button mat-stroked-button color="warn" (click)="promptReject(p)" [disabled]="processing[p.id]">
                  <mat-icon>close</mat-icon> Reject
                </button>
              </div>
            </div>
            <!-- Reject reason input -->
            <div class="reject-form" *ngIf="rejectingId === p.id">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Rejection Reason</mat-label>
                <textarea matInput [(ngModel)]="rejectReason" rows="2"></textarea>
              </mat-form-field>
              <div class="reject-actions">
                <button mat-button (click)="rejectingId = null">Cancel</button>
                <button mat-raised-button color="warn" (click)="confirmReject(p)">Confirm Reject</button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        <p *ngIf="pendingProviders.length === 0" class="empty">No pending provider validations.</p>
      </div>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .providers-list { display: flex; flex-direction: column; gap: 16px; }
    .provider-card { border-radius: 16px !important; }
    .provider-row { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
    .provider-info { display: flex; gap: 12px; flex: 1; min-width: 200px; }
    .avatar-img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
    .avatar-icon { font-size: 48px; width: 48px; height: 48px; color: #93c5fd; }
    .provider-info h3 { font-size: 18px; font-weight: 600; margin: 0 0 4px; color: #0f172a; }
    .provider-info p { color: #64748b; margin: 0 0 4px; font-size: 14px; }
    .bio { font-style: italic; }
    .documents { flex: 1; min-width: 200px; }
    .documents h4 { font-size: 14px; font-weight: 600; margin: 0 0 8px; color: #0f172a; }
    .doc-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .doc-item span { flex: 1; font-size: 14px; }
    .actions { display: flex; flex-direction: column; gap: 8px; }
    .reject-form { margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    .full-width { width: 100%; }
    .reject-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .empty { text-align: center; color: #938F99; padding: 32px; }
  `]
})
export class ProviderValidationComponent implements OnInit {
  pendingProviders: PrestataireProfile[] = [];
  loading = false;
  processing: Record<string, boolean> = {};
  rejectingId: string | null = null;
  rejectReason = '';
  readonly apiUrl = environment.apiUrl;

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loading = true;
    this.adminService.getPendingPrestataires().subscribe({
      next: p => { this.pendingProviders = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  approve(p: PrestataireProfile): void {
    this.processing[p.id] = true;
    this.adminService.approvePrestataire(p.id).subscribe({
      next: () => {
        this.pendingProviders = this.pendingProviders.filter(x => x.id !== p.id);
        this.snackBar.open(`${p.user?.name || 'Provider'} approved!`, 'Close', { duration: 3000 });
      },
      error: () => { this.processing[p.id] = false; }
    });
  }

  promptReject(p: PrestataireProfile): void {
    this.rejectingId = p.id;
    this.rejectReason = '';
  }

  confirmReject(p: PrestataireProfile): void {
    this.processing[p.id] = true;
    this.adminService.rejectPrestataire(p.id, this.rejectReason).subscribe({
      next: () => {
        this.pendingProviders = this.pendingProviders.filter(x => x.id !== p.id);
        this.rejectingId = null;
        this.snackBar.open(`${p.user?.name || 'Provider'} rejected.`, 'Close', { duration: 3000 });
      },
      error: () => { this.processing[p.id] = false; }
    });
  }

  getImageSrc(path?: string | null): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.apiUrl}${path.startsWith('/uploads/') ? path : '/uploads/' + path}`;
  }

  getDocUrl(path: string): string {
    return path.startsWith('http') ? path : `${this.apiUrl}${path.startsWith('/uploads/') ? path : '/uploads/' + path}`;
  }
}
