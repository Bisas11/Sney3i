import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../../core/services/service.service';
import { CategoryService } from '../../../core/services/category.service';
import { Service } from '../../../shared/models/service.model';
import { ServiceCategory, ServiceSubcategory } from '../../../shared/models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-manage-services',
  template: `
    <div class="page">
      <div class="page-header">
        <h1>My Services</h1>
        <button mat-raised-button color="primary" (click)="openAddForm()">
          <mat-icon>add</mat-icon> Add Service
        </button>
      </div>

      <!-- Add/Edit Form -->
      <mat-card *ngIf="showAddForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingService ? 'Edit' : 'Add' }} Service</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Service Title</mat-label>
              <input matInput [(ngModel)]="formData.title">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Price (DT)</mat-label>
              <input matInput type="number" [(ngModel)]="formData.price">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="selectedCategoryId" (ngModelChange)="onCategoryChange($event)">
                <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Subcategory</mat-label>
              <mat-select [(ngModel)]="formData.sous_category_id">
                <mat-option *ngFor="let sc of subcategories" [value]="sc.id">{{ sc.name }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="formData.description" rows="3"></textarea>
          </mat-form-field>
          <div class="file-upload">
            <span class="file-label">Service Image</span>
            <label class="modern-upload">
              <span class="upload-icon"><mat-icon>cloud_upload</mat-icon></span>
              <span class="upload-copy">
                <strong>{{ selectedImageName || 'Upload a service image' }}</strong>
                <span>PNG, JPG or JPEG. The image will be cropped neatly inside the card.</span>
              </span>
              <span class="upload-action">
                <mat-icon>attach_file</mat-icon>
                Browse
              </span>
              <input type="file" accept="image/*" (change)="onImageSelected($event)">
            </label>
          </div>
          <div class="form-actions">
            <button mat-button (click)="cancelEdit()">Cancel</button>
            <button mat-raised-button color="primary" (click)="saveService()" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Services Grid -->
      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      <div class="services-grid" *ngIf="!loading">
        <mat-card *ngFor="let s of services" class="service-card">
          <div class="service-image-wrap">
            <img *ngIf="s.image_url" [src]="getImageSrc(s.image_url)" class="service-img" alt="Service image">
            <div *ngIf="!s.image_url" class="service-img-placeholder">
              <mat-icon>home_repair_service</mat-icon>
            </div>
          </div>
          <mat-card-content>
            <div class="service-header">
              <h3>{{ s.title }}</h3>
              <span class="price">{{ s.price }} DT</span>
            </div>
            <p>{{ s.description }}</p>
            <span class="status-chip" [ngClass]="s.status">{{ s.status }}</span>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-icon-button (click)="editService(s)" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="accent" (click)="pauseService(s)" matTooltip="Pause" *ngIf="s.status === 'active'">
              <mat-icon>pause</mat-icon>
            </button>
            <button mat-icon-button color="primary" (click)="resumeService(s)" matTooltip="Resume" *ngIf="s.status === 'paused'">
              <mat-icon>play_arrow</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteService(s)" matTooltip="Delete">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
        <p *ngIf="services.length === 0" class="empty">No services yet. Add your first service!</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .form-card { border-radius: 16px !important; margin-bottom: 24px; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    .file-upload { margin-bottom: 18px; }
    .file-label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .04em; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .service-card { border-radius: 16px !important; overflow: hidden; }
    .service-image-wrap { height: 160px; overflow: hidden; background: linear-gradient(135deg, #dbeafe, #f8fafc); display: flex; align-items: center; justify-content: center; }
    .service-img { width: 100%; height: 100%; display: block; object-fit: cover; }
    .service-img-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #076ab8; }
    .service-img-placeholder mat-icon { font-size: 44px; width: 44px; height: 44px; }
    .service-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .service-header h3 { font-size: 16px; font-weight: 600; margin: 0; color: #0f172a; }
    .price { color: #0066ff; font-weight: 600; }
    .service-card p { color: #64748b; margin: 0 0 8px; }
    .status-chip { font-size: 12px; padding: 2px 10px; border-radius: 12px; }
    .status-chip.active { background: #dcfce7; color: #16a34a; }
    .status-chip.paused { background: #fef9c3; color: #ca8a04; }
    .status-chip.suspended { background: #fee2e2; color: #dc2626; }
    .empty { text-align: center; color: #938F99; padding: 32px; }
  `]
})
export class ManageServicesComponent implements OnInit {
  services: Service[] = [];
  categories: ServiceCategory[] = [];
  subcategories: ServiceSubcategory[] = [];
  showAddForm = false;
  editingService: Service | null = null;
  loading = false;
  saving = false;
  selectedCategoryId = '';
  selectedImageName = '';
  readonly apiUrl = environment.apiUrl;
  formData: { title: string; description: string; price: number; sous_category_id: string; image?: File } = {
    title: '', description: '', price: 0, sous_category_id: ''
  };

  constructor(
    private serviceService: ServiceService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
  }

  loadServices(): void {
    this.loading = true;
    this.serviceService.getMyServices().subscribe({
      next: svcs => { this.services = svcs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAddForm(): void {
    this.editingService = null;
    this.formData = { title: '', description: '', price: 0, sous_category_id: '' };
    this.selectedCategoryId = '';
    this.selectedImageName = '';
    this.subcategories = [];
    this.showAddForm = true;
  }

  onCategoryChange(categoryId: string): void {
    const cat = this.categories.find(c => c.id === categoryId);
    this.subcategories = cat?.sous_categories ?? [];
    this.formData.sous_category_id = '';
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.formData.image = file;
      this.selectedImageName = file.name;
    }
  }

  getImageSrc(path?: string | null): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.apiUrl}${path.startsWith('/uploads/') ? path : '/uploads/' + path}`;
  }

  editService(s: Service): void {
    this.editingService = s;
    this.formData = { title: s.title, description: s.description, price: parseFloat(String(s.price)), sous_category_id: s.sous_category_id ?? '' };
    this.selectedImageName = '';
    this.showAddForm = true;
  }

  saveService(): void {
    this.saving = true;
    const fd = new FormData();
    fd.append('title', this.formData.title);
    fd.append('description', this.formData.description);
    fd.append('price', String(this.formData.price));
    if (this.formData.sous_category_id) fd.append('sous_category_id', this.formData.sous_category_id);
    if (this.formData.image) fd.append('image', this.formData.image);

    const req$ = this.editingService
      ? this.serviceService.updateService(this.editingService.id, fd)
      : this.serviceService.createService(fd);

    req$.subscribe({
      next: () => {
        this.snackBar.open('Service saved!', 'Close', { duration: 3000 });
        this.cancelEdit();
        this.loadServices();
      },
      error: () => { this.saving = false; }
    });
  }

  pauseService(s: Service): void {
    this.serviceService.pauseService(s.id).subscribe(() => {
      s.status = 'paused';
      this.snackBar.open('Service paused.', 'Close', { duration: 3000 });
    });
  }

  resumeService(s: Service): void {
    this.serviceService.resumeService(s.id).subscribe(() => {
      s.status = 'active';
      this.snackBar.open('Service resumed.', 'Close', { duration: 3000 });
    });
  }

  deleteService(s: Service): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Service', message: `Delete "${s.title}"?` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.serviceService.deleteService(s.id).subscribe(() => {
          this.services = this.services.filter(x => x.id !== s.id);
          this.snackBar.open('Service deleted.', 'Close', { duration: 3000 });
        });
      }
    });
  }

  cancelEdit(): void {
    this.showAddForm = false;
    this.editingService = null;
    this.saving = false;
    this.formData = { title: '', description: '', price: 0, sous_category_id: '' };
    this.selectedImageName = '';
  }
}
