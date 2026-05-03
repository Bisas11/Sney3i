import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../shared/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-users',
  template: `
    <div class="page">
      <h1>Manage Users</h1>
      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      <mat-card class="table-card" *ngIf="!loading">
        <table mat-table [dataSource]="users" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let u">{{ u.name }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{ u.email }}</td>
          </ng-container>
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let u">{{ u.role | titlecase }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let u">
              <app-status-badge [status]="u.is_suspended || !u.is_active ? 'rejected' : 'approved'"></app-status-badge>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let u">
              <ng-container *ngIf="!suspendingId || suspendingId !== u.id">
                <button mat-icon-button *ngIf="!u.is_suspended" color="warn"
                        matTooltip="Suspend" (click)="promptSuspend(u)">
                  <mat-icon>block</mat-icon>
                </button>
                <button mat-icon-button *ngIf="u.is_suspended" color="primary"
                        matTooltip="Reinstate" (click)="reinstate(u)">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button color="primary" matTooltip="Edit" (click)="edit(u)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button *ngIf="u.is_active" color="warn"
                        matTooltip="Deactivate" (click)="deactivate(u)">
                  <mat-icon>person_off</mat-icon>
                </button>
                <button mat-icon-button *ngIf="!u.is_active" color="primary"
                        matTooltip="Activate" (click)="activate(u)">
                  <mat-icon>person</mat-icon>
                </button>
              </ng-container>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card>

      <mat-card class="suspend-form" *ngIf="editingUser">
        <mat-card-header>
          <mat-card-title>Edit {{ editingUser.name }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="edit-grid">
            <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="editForm.name"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput [(ngModel)]="editForm.phone_number"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Address</mat-label><input matInput [(ngModel)]="editForm.address"></mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button (click)="editingUser = null">Cancel</button>
          <button mat-raised-button color="primary" (click)="saveEdit()">Save</button>
        </mat-card-actions>
      </mat-card>

      <!-- Suspend reason dialog inline -->
      <mat-card class="suspend-form" *ngIf="suspendingUser">
        <mat-card-header>
          <mat-card-title>Suspend {{ suspendingUser.name }}?</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason</mat-label>
            <input matInput [(ngModel)]="suspendReason">
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button (click)="suspendingUser = null">Cancel</button>
          <button mat-raised-button color="warn" (click)="confirmSuspend()">Confirm Suspend</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .table-card { border-radius: 16px !important; margin-bottom: 20px; }
    .full-width { width: 100%; }
    .suspend-form { border-radius: 16px !important; margin-top: 16px; }
    .edit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  `]
})
export class ManageUsersComponent implements OnInit {
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];
  users: User[] = [];
  loading = false;
  suspendingUser: User | null = null;
  editingUser: User | null = null;
  suspendingId: string | null = null;
  suspendReason = '';
  editForm = { name: '', phone_number: '', address: '' };

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  promptSuspend(user: User): void {
    this.suspendingUser = user;
    this.suspendingId = user.id;
    this.suspendReason = '';
  }

  confirmSuspend(): void {
    if (!this.suspendingUser) return;
    const user = this.suspendingUser;
    this.adminService.suspendUser(user.id, this.suspendReason).subscribe({
      next: () => {
        user.is_suspended = true;
        this.users = [...this.users];
        this.suspendingUser = null;
        this.suspendingId = null;
        this.snackBar.open(`${user.name} suspended.`, 'Close', { duration: 3000 });
      }
    });
  }

  reinstate(user: User): void {
    this.adminService.reinstateUser(user.id).subscribe({
      next: () => {
        user.is_suspended = false;
        this.users = [...this.users];
        this.snackBar.open(`${user.name} reinstated.`, 'Close', { duration: 3000 });
      }
    });
  }

  edit(user: User): void {
    this.editingUser = user;
    this.editForm = {
      name: user.name || '',
      phone_number: user.phone_number || '',
      address: user.address || ''
    };
  }

  saveEdit(): void {
    if (!this.editingUser) return;
    const user = this.editingUser;
    this.adminService.updateUser(user.id, this.editForm).subscribe({
      next: updated => {
        Object.assign(user, updated);
        this.users = [...this.users];
        this.editingUser = null;
        this.snackBar.open(`${user.name} updated.`, 'Close', { duration: 3000 });
      }
    });
  }

  deactivate(user: User): void {
    this.adminService.deactivateUser(user.id).subscribe({
      next: () => {
        user.is_active = false;
        this.users = [...this.users];
        this.snackBar.open(`${user.name} deactivated.`, 'Close', { duration: 3000 });
      }
    });
  }

  activate(user: User): void {
    this.adminService.activateUser(user.id).subscribe({
      next: () => {
        user.is_active = true;
        this.users = [...this.users];
        this.snackBar.open(`${user.name} activated.`, 'Close', { duration: 3000 });
      }
    });
  }
}
