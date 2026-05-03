import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { ServiceRequest } from '../../../shared/models/request.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-incoming-requests',
  template: `
    <div class="page">
      <h1>Incoming Requests</h1>
      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      <div class="requests-list" *ngIf="!loading">
        <mat-card *ngFor="let r of requests" class="request-card" (click)="openDetail(r)">
          <mat-card-content>
            <div class="request-row">
              <div class="info">
                <h3>{{ r.service?.title }}</h3>
                <p><mat-icon>person</mat-icon> {{ r.client?.name || 'Unknown client' }}</p>
                <p><mat-icon>chat</mat-icon> {{ r.client_message || 'No message' }}</p>
                <p><mat-icon>event</mat-icon> {{ (r.start_date || r.created_at) | date:'mediumDate' }}</p>
              </div>
              <div class="actions">
                <app-status-badge [status]="r.status"></app-status-badge>
                <div class="btn-group" *ngIf="r.status === 'pending'">
                  <button mat-raised-button color="primary" (click)="accept(r); $event.stopPropagation()" [disabled]="processing[r.id]">
                    <mat-icon>check</mat-icon> Accept
                  </button>
                  <button mat-stroked-button color="warn" (click)="reject(r); $event.stopPropagation()" [disabled]="processing[r.id]">
                    <mat-icon>close</mat-icon> Reject
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        <p *ngIf="requests.length === 0" class="empty">No active requests.</p>
      </div>

      <mat-card class="detail-card" *ngIf="selectedRequest">
        <mat-card-header>
          <mat-card-title>{{ selectedRequest.service?.title }}</mat-card-title>
          <mat-card-subtitle>{{ selectedRequest.client?.name || 'Unknown client' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="detail-message">{{ selectedRequest.client_message || 'No message provided.' }}</p>
          <div class="contact-grid">
            <div class="contact-item" *ngIf="selectedRequest.client?.phone_number">
              <mat-icon>phone</mat-icon>
              <a [href]="whatsAppUrl(selectedRequest.client!.phone_number!)" target="_blank">
                {{ selectedRequest.client?.phone_number }}
              </a>
              <button mat-stroked-button (click)="copy(selectedRequest.client!.phone_number!)">Copy</button>
              <button mat-raised-button color="primary" (click)="openUrl(whatsAppUrl(selectedRequest.client!.phone_number!))">WhatsApp</button>
            </div>
            <div class="contact-item" *ngIf="selectedRequest.client?.email">
              <mat-icon>mail</mat-icon>
              <a [href]="'mailto:' + selectedRequest.client?.email">{{ selectedRequest.client?.email }}</a>
              <button mat-stroked-button (click)="copy(selectedRequest.client!.email!)">Copy</button>
              <button mat-raised-button color="primary" (click)="openUrl('mailto:' + selectedRequest.client!.email!)">Email</button>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button (click)="selectedRequest = null">Close</button>
          <button mat-raised-button color="primary" [disabled]="processing[selectedRequest.id]" (click)="accept(selectedRequest)">
            <mat-icon>check</mat-icon> Accept Request
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .requests-list { display: flex; flex-direction: column; gap: 16px; }
    .request-card { border-radius: 16px !important; cursor: pointer; }
    .request-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .info h3 { font-size: 18px; font-weight: 600; margin: 0 0 8px; color: #0f172a; }
    .info p { display: flex; align-items: center; gap: 6px; color: #64748b; margin: 4px 0; font-size: 14px; }
    .info mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .btn-group { display: flex; gap: 8px; }
    .empty { text-align: center; color: #938F99; padding: 32px; }
    .detail-card { border-radius: 16px !important; margin-top: 20px; }
    .detail-message { color: #64748b; line-height: 1.6; }
    .contact-grid { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .contact-item { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; color: #64748b; }
    .contact-item mat-icon { color: #076ab8; }
  `]
})
export class IncomingRequestsComponent implements OnInit {
  requests: ServiceRequest[] = [];
  loading = false;
  processing: Record<string, boolean> = {};
  selectedRequest: ServiceRequest | null = null;

  constructor(private requestService: RequestService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loading = true;
    this.requestService.getMissions().subscribe({
      next: reqs => {
        this.requests = reqs.filter(r => r.status === 'pending');
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openDetail(r: ServiceRequest): void {
    this.selectedRequest = r;
  }

  accept(r: ServiceRequest): void {
    this.processing[r.id] = true;
    this.requestService.transitionStatus(r.id, 'accepted').subscribe({
      next: () => {
        this.processing[r.id] = false;
        this.updateOrRemove(r, 'accepted');
      },
      error: () => { this.processing[r.id] = false; }
    });
  }

  reject(r: ServiceRequest): void {
    this.processing[r.id] = true;
    this.requestService.transitionStatus(r.id, 'rejected').subscribe({
      next: () => {
        this.processing[r.id] = false;
        this.updateOrRemove(r, 'rejected');
      },
      error: () => { this.processing[r.id] = false; }
    });
  }

  start(r: ServiceRequest): void {
    this.processing[r.id] = true;
    this.requestService.transitionStatus(r.id, 'in_progress').subscribe({
      next: () => {
        this.processing[r.id] = false;
        this.updateOrRemove(r, 'in_progress');
      },
      error: () => { this.processing[r.id] = false; }
    });
  }

  complete(r: ServiceRequest): void {
    this.processing[r.id] = true;
    this.requestService.transitionStatus(r.id, 'done').subscribe({
      next: () => {
        this.processing[r.id] = false;
        this.updateOrRemove(r, 'done');
      },
      error: () => { this.processing[r.id] = false; }
    });
  }

  cancel(r: ServiceRequest): void {
    this.processing[r.id] = true;
    this.requestService.transitionStatus(r.id, 'cancelled').subscribe({
      next: () => {
        this.processing[r.id] = false;
        this.updateOrRemove(r, 'cancelled');
      },
      error: () => { this.processing[r.id] = false; }
    });
  }

  private updateOrRemove(r: ServiceRequest, status: ServiceRequest['status']): void {
    r.status = status;
    if (status !== 'pending') {
      this.requests = this.requests.filter(x => x.id !== r.id);
      if (this.selectedRequest?.id === r.id) this.selectedRequest = null;
      return;
    }
    this.requests = [...this.requests];
  }

  whatsAppUrl(phone: string): string {
    const digits = phone.replace(/[^\d]/g, '');
    return `https://wa.me/${digits}`;
  }

  openUrl(url: string): void {
    window.open(url, '_blank');
  }

  copy(value: string): void {
    navigator.clipboard?.writeText(value);
    this.snackBar.open('Copied to clipboard.', 'Close', { duration: 2000 });
  }
}
