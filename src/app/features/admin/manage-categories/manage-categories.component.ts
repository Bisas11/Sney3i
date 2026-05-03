import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../core/services/category.service';
import { ServiceCategory } from '../../../shared/models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-categories',
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Manage Categories</h1>
        <button mat-raised-button color="primary" (click)="openAddForm()">
          <mat-icon>add</mat-icon> Add Category
        </button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Category Name</mat-label>
            <input matInput [(ngModel)]="formData.name">
          </mat-form-field>
          <div class="form-actions">
            <button mat-button (click)="cancelForm()">Cancel</button>
            <button mat-raised-button color="primary" (click)="saveCategory()" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Sub-category add form -->
      <mat-card *ngIf="addingSubForCategoryId" class="form-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Subcategory Name</mat-label>
            <input matInput [(ngModel)]="subFormName">
          </mat-form-field>
          <div class="form-actions">
            <button mat-button (click)="addingSubForCategoryId = null">Cancel</button>
            <button mat-raised-button color="primary" (click)="saveSubcategory()" [disabled]="saving">Save</button>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      <div class="categories-list" *ngIf="!loading">
        <mat-card *ngFor="let cat of categories" class="category-card">
          <mat-card-content>
            <div class="cat-header">
              <div class="cat-info">
                <h3>{{ cat.name }}</h3>
                <span class="status-chip" [ngClass]="cat.status ? 'active' : 'inactive'">
                  {{ cat.status ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="cat-actions">
                <button mat-icon-button matTooltip="Add subcategory" (click)="openAddSubForm(cat.id)">
                  <mat-icon>add_circle</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Edit" (click)="editCategory(cat)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteCategory(cat)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
            <mat-divider></mat-divider>
            <div class="subcategories">
              <div class="sub-item" *ngFor="let sub of cat.sous_categories">
                <mat-icon>subdirectory_arrow_right</mat-icon>
                <span>{{ sub.name }}</span>
                <button mat-icon-button color="warn" matTooltip="Delete subcategory"
                        (click)="deleteSubcategory(sub.id, cat)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <p *ngIf="!cat.sous_categories?.length" class="no-subs">No subcategories</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .form-card { border-radius: 16px !important; margin-bottom: 24px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .categories-list { display: flex; flex-direction: column; gap: 16px; }
    .category-card { border-radius: 16px !important; }
    .cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .cat-info { display: flex; align-items: center; gap: 12px; }
    .cat-info h3 { font-size: 18px; font-weight: 600; margin: 0; color: #0f172a; }
    .status-chip { font-size: 12px; padding: 2px 10px; border-radius: 12px; }
    .status-chip.active { background: #dcfce7; color: #16a34a; }
    .status-chip.inactive { background: #fee2e2; color: #dc2626; }
    .cat-actions { display: flex; }
    .subcategories { padding-top: 12px; }
    .sub-item { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
    .sub-item span { flex: 1; color: #475569; font-size: 14px; }
    .sub-item mat-icon { color: #94a3b8; font-size: 18px; width: 18px; height: 18px; }
    .no-subs { color: #94a3b8; font-size: 13px; margin: 8px 0 0; }
  `]
})
export class ManageCategoriesComponent implements OnInit {
  categories: ServiceCategory[] = [];
  showForm = false;
  editingCategory: ServiceCategory | null = null;
  loading = false;
  saving = false;
  formData = { name: '' };
  addingSubForCategoryId: string | null = null;
  subFormName = '';

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: c => { this.categories = c; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAddForm(): void {
    this.editingCategory = null;
    this.formData = { name: '' };
    this.showForm = true;
  }

  editCategory(cat: ServiceCategory): void {
    this.editingCategory = cat;
    this.formData = { name: cat.name };
    this.showForm = true;
  }

  saveCategory(): void {
    this.saving = true;
    const req$ = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory.id, { name: this.formData.name })
      : this.categoryService.addCategory(this.formData.name);

    req$.subscribe({
      next: () => {
        this.snackBar.open('Category saved!', 'Close', { duration: 3000 });
        this.cancelForm();
        this.loadCategories();
      },
      error: () => { this.saving = false; }
    });
  }

  deleteCategory(cat: ServiceCategory): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Category', message: `Delete "${cat.name}" and all its subcategories?` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.categoryService.deleteCategory(cat.id).subscribe(() => {
          this.categories = this.categories.filter(c => c.id !== cat.id);
          this.snackBar.open('Category deleted.', 'Close', { duration: 3000 });
        });
      }
    });
  }

  openAddSubForm(categoryId: string): void {
    this.addingSubForCategoryId = categoryId;
    this.subFormName = '';
  }

  saveSubcategory(): void {
    if (!this.addingSubForCategoryId) return;
    this.saving = true;
    this.categoryService.addSousCategory(this.addingSubForCategoryId, this.subFormName).subscribe({
      next: () => {
        this.snackBar.open('Subcategory added!', 'Close', { duration: 3000 });
        this.addingSubForCategoryId = null;
        this.saving = false;
        this.loadCategories();
      },
      error: () => { this.saving = false; }
    });
  }

  deleteSubcategory(subId: string, cat: ServiceCategory): void {
    this.categoryService.deleteSousCategory(subId).subscribe(() => {
      if (cat.sous_categories) {
        cat.sous_categories = cat.sous_categories.filter(s => s.id !== subId);
        this.categories = [...this.categories];
      }
      this.snackBar.open('Subcategory deleted.', 'Close', { duration: 3000 });
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.saving = false;
    this.formData = { name: '' };
  }
}
