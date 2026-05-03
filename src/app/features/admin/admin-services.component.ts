import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import { CategoryService } from '../../core/services/category.service';
import { Service } from '../../shared/models/service.model';
import { User } from '../../shared/models/user.model';
import { ServiceCategory, ServiceSubcategory } from '../../shared/models/category.model';

@Component({
  selector: 'app-admin-services',
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Service Management</h1>
        <button mat-raised-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> Add Service</button>
      </div>

      <mat-card *ngIf="editing" class="form-card">
        <mat-card-content>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Provider</mat-label>
              <mat-select [(ngModel)]="form.prestataire_id" [disabled]="!!editingServiceId">
                <mat-option *ngFor="let u of prestataires" [value]="u.id">{{ u.name }} - {{ u.email }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Price</mat-label>
              <input matInput [(ngModel)]="form.price">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="form.title">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="selectedCategoryId" (ngModelChange)="onCategoryChange($event)">
                <mat-option value="">None</mat-option>
                <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Subcategory</mat-label>
              <mat-select [(ngModel)]="form.sous_category_id">
                <mat-option value="">None</mat-option>
                <mat-option *ngFor="let s of subcategories" [value]="s.id">{{ s.name }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput rows="3" [(ngModel)]="form.description"></textarea>
          </mat-form-field>
          <div class="form-actions">
            <button mat-button (click)="editing = false">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="saving" (click)="save()">{{ saving ? 'Saving...' : 'Save' }}</button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="table-card">
        <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
        <table mat-table [dataSource]="services" class="full-width" *ngIf="!loading">
          <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Title</th><td mat-cell *matCellDef="let s">{{ s.title }}</td></ng-container>
          <ng-container matColumnDef="provider"><th mat-header-cell *matHeaderCellDef>Provider</th><td mat-cell *matCellDef="let s">{{ s.prestataire?.name || '—' }}</td></ng-container>
          <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Price</th><td mat-cell *matCellDef="let s">{{ s.price }} DT</td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let s"><app-status-badge [status]="s.status"></app-status-badge></td></ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let s">
              <button mat-icon-button (click)="openEdit(s)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="delete(s)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:16px; flex-wrap:wrap; }
    h1 { font-size:28px; font-weight:700; color:#0f172a; margin:0; }
    .table-card, .form-card { border-radius:16px !important; margin-bottom:20px; }
    .form-row { display:flex; gap:12px; flex-wrap:wrap; }
    .form-row mat-form-field { flex:1; min-width:200px; }
    .full-width { width:100%; }
    .form-actions { display:flex; justify-content:flex-end; gap:8px; }
    .loading { display:flex; justify-content:center; padding:48px; }
  `]
})
export class AdminServicesComponent implements OnInit {
  services: Service[] = [];
  users: User[] = [];
  categories: ServiceCategory[] = [];
  subcategories: ServiceSubcategory[] = [];
  columns = ['title', 'provider', 'price', 'status', 'actions'];
  loading = false;
  saving = false;
  editing = false;
  editingServiceId: string | null = null;
  selectedCategoryId = '';
  form = { prestataire_id: '', title: '', description: '', price: '', sous_category_id: '' };

  get prestataires(): User[] {
    return this.users.filter(u => u.role === 'prestataire' || u.role === 'provider');
  }

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
    this.adminService.getUsers().subscribe(users => this.users = users);
    this.categoryService.getCategories().subscribe(categories => this.categories = categories);
  }

  load(): void {
    this.loading = true;
    this.adminService.getServices().subscribe({
      next: services => { this.services = services; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editing = true;
    this.editingServiceId = null;
    this.selectedCategoryId = '';
    this.subcategories = [];
    this.form = { prestataire_id: '', title: '', description: '', price: '', sous_category_id: '' };
  }

  openEdit(service: Service): void {
    this.editing = true;
    this.editingServiceId = service.id;
    this.selectedCategoryId = service.sous_category?.category?.id || '';
    this.subcategories = this.categories.find(c => c.id === this.selectedCategoryId)?.sous_categories ?? [];
    this.form = {
      prestataire_id: service.prestataire_id,
      title: service.title,
      description: service.description,
      price: service.price,
      sous_category_id: service.sous_category_id || ''
    };
  }

  onCategoryChange(categoryId: string): void {
    this.subcategories = this.categories.find(c => c.id === categoryId)?.sous_categories ?? [];
    this.form.sous_category_id = '';
  }

  save(): void {
    this.saving = true;
    const request$ = this.editingServiceId
      ? this.adminService.updateService(this.editingServiceId, this.form)
      : this.adminService.createService(this.form);
    request$.subscribe({
      next: () => {
        this.saving = false;
        this.editing = false;
        this.snackBar.open('Service saved.', 'Close', { duration: 3000 });
        this.load();
      },
      error: err => {
        this.saving = false;
        this.snackBar.open(err?.error?.error?.message || 'Could not save service', 'Close', { duration: 4000 });
      }
    });
  }

  delete(service: Service): void {
    const reason = `Admin deleted service "${service.title}"`;
    this.adminService.deleteService(service.id, reason).subscribe({
      next: () => {
        this.services = this.services.filter(s => s.id !== service.id);
        this.snackBar.open('Service deleted.', 'Close', { duration: 3000 });
      }
    });
  }
}
