import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SendRequestDialogData {
  service_id: string;
  serviceTitle: string;
  prestataireNom: string;
}

export interface SendRequestResult {
  client_message: string;
}

@Component({
  selector: 'app-send-request-dialog',
  template: `
    <div class="request-dialog">

      <div class="dialog-head">
        <div class="head-icon">
          <mat-icon>send</mat-icon>
        </div>
        <div class="head-text">
          <h2 mat-dialog-title>Send Service Request</h2>
          <p>to <strong>{{ data.prestataireNom }}</strong></p>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="provider-badge">
          <mat-icon class="avatar-icon">home_repair_service</mat-icon>
          <div class="provider-info">
            <span class="provider-name">{{ data.serviceTitle }}</span>
            <span class="provider-profession">by {{ data.prestataireNom }}</span>
          </div>
        </div>

        <form [formGroup]="requestForm">
          <div class="form-group">
            <label class="field-label">
              Message <span class="optional-label">(optional)</span>
            </label>
            <textarea
              formControlName="client_message"
              class="msg-textarea"
              rows="4"
              placeholder="Describe what you need help with, preferred time slots, or any special requirements..."
            ></textarea>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close class="btn-cancel">Cancel</button>
        <button mat-raised-button class="btn-send" (click)="confirm()">
          <mat-icon>send</mat-icon>
          Send Request
        </button>
      </mat-dialog-actions>

    </div>
  `,
  styleUrls: ['./send-request-dialog.component.scss']
})
export class SendRequestDialogComponent {
  requestForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SendRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendRequestDialogData,
    private fb: FormBuilder
  ) {
    this.requestForm = this.fb.group({
      client_message: ['']
    });
  }

  confirm(): void {
    this.dialogRef.close({
      client_message: this.requestForm.value.client_message || ''
    } as SendRequestResult);
  }
}
