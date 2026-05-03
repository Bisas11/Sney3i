import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from '../../../core/services/service.service';
import { CategoryService } from '../../../core/services/category.service';
import { Service } from '../../../shared/models/service.model';
import { ServiceCategory } from '../../../shared/models/category.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-search',
  template: `
    <!-- Compact search strip -->
    <div class="search-strip">
      <div class="search-strip-inner">
        <mat-icon class="strip-icon">search</mat-icon>
        <input type="text" [(ngModel)]="searchText" placeholder="Search services..."
               (keyup.enter)="loadServices(true)">
        <button class="strip-btn" (click)="loadServices(true)">Search</button>
      </div>
    </div>

    <!-- Main content -->
    <div class="search-layout">
      <!-- Filters sidebar -->
      <aside class="filters-sidebar">
        <h3 class="filters-title">
          <mat-icon>tune</mat-icon>
          Filters
        </h3>

        <!-- Category -->
        <div class="filter-group">
          <label class="filter-label">Category</label>
          <div class="category-buttons">
            <button *ngFor="let cat of categories" class="category-btn"
                    [class.active]="selectedCategoryId === cat.id"
                    (click)="selectCategory(cat)">
              <span>{{ cat.name }}</span>
              <mat-icon *ngIf="selectedCategoryId === cat.id">check</mat-icon>
            </button>
          </div>
        </div>

        <div class="filter-group" *ngIf="selectedSubcategories.length > 0">
          <label class="filter-label">Subcategory</label>
          <div class="category-buttons">
            <button *ngFor="let sub of selectedSubcategories" class="category-btn"
                    [class.active]="selectedSubcategoryId === sub.id"
                    (click)="selectSubcategory(sub.id)">
              <span>{{ sub.name }}</span>
              <mat-icon *ngIf="selectedSubcategoryId === sub.id">check</mat-icon>
            </button>
          </div>
        </div>

        <!-- Region -->
        <div class="filter-group">
          <label class="filter-label">Region</label>
          <div class="region-input">
            <mat-icon>map</mat-icon>
            <mat-select [(ngModel)]="selectedRegion" (ngModelChange)="loadServices(true)"
                        placeholder="All Regions" class="region-select">
              <mat-option value="">All Regions</mat-option>
              <mat-option *ngFor="let r of regions" [value]="r">{{ r }}</mat-option>
            </mat-select>
          </div>
        </div>

        <!-- Sort -->
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <div class="region-input">
            <mat-icon>sort</mat-icon>
            <mat-select [(ngModel)]="sortBy" (ngModelChange)="loadServices(true)"
                        placeholder="Default" class="region-select">
              <mat-option value="">Default</mat-option>
              <mat-option value="price">Price</mat-option>
              <mat-option value="reviews">Reviews</mat-option>
              <mat-option value="date">Newest</mat-option>
            </mat-select>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Order</label>
          <div class="region-input">
            <mat-icon>swap_vert</mat-icon>
            <mat-select [(ngModel)]="order" (ngModelChange)="loadServices(true)"
                        class="region-select">
              <mat-option value="desc">Descending</mat-option>
              <mat-option value="asc">Ascending</mat-option>
            </mat-select>
          </div>
        </div>

        <button class="clear-btn" (click)="clearFilters()">Clear All Filters</button>
      </aside>

      <!-- Results grid -->
      <div class="results-area">
        <div class="results-header">
          <h2>Services</h2>
          <span class="results-count">{{ total }} services found</span>
        </div>

        <div class="providers-grid" *ngIf="!loading">
          <div *ngFor="let s of services" class="provider-card">
            <div class="card-image">
              <img *ngIf="s.image_url" [src]="getImageSrc(s.image_url)" [alt]="s.title" class="service-img">
              <div *ngIf="!s.image_url" class="service-img-placeholder"><mat-icon>home_repair_service</mat-icon></div>
            </div>
            <div class="card-body">
              <div class="card-header">
                <div class="avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <div>
                  <h4>{{ s.title }}</h4>
                  <span class="profession">{{ s.prestataire?.name }}</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="price">{{ s.price }}<span class="unit"> DT</span></span>
                <button class="view-btn" [routerLink]="['/services', s.id]">View Service</button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && services.length === 0" class="no-results">
          <mat-icon>search_off</mat-icon>
          <h3>No services found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>

        <!-- Pagination -->
        <mat-paginator *ngIf="total > limit"
          [length]="total"
          [pageSize]="limit"
          [pageIndex]="page - 1"
          (page)="onPageChange($event)">
        </mat-paginator>
      </div>
    </div>
  `,
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  services: Service[] = [];
  categories: ServiceCategory[] = [];
  selectedSubcategories: ServiceCategory['sous_categories'] = [];
  selectedCategoryId = '';
  selectedSubcategoryId = '';
  selectedRegion = '';
  searchText = '';
  sortBy = '';
  order: 'asc' | 'desc' = 'desc';
  total = 0;
  page = 1;
  limit = 12;
  loading = false;
  readonly apiUrl = environment.apiUrl;

  regions = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
    'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Sousse',
    'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
    'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ];

  constructor(
    private serviceService: ServiceService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
      if (this.selectedCategoryId) {
        this.selectedSubcategories = cats.find(c => c.id === this.selectedCategoryId)?.sous_categories ?? [];
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchText = params['q'];
      if (params['region']) this.selectedRegion = params['region'];
      if (params['categoryId']) this.selectedCategoryId = params['categoryId'];
      if (params['sousCategoryId']) this.selectedSubcategoryId = params['sousCategoryId'];
      this.loadServices(true);
    });
  }

  selectCategory(cat: ServiceCategory): void {
    this.selectedCategoryId = this.selectedCategoryId === cat.id ? '' : cat.id;
    this.selectedSubcategories = this.selectedCategoryId ? cat.sous_categories ?? [] : [];
    this.selectedSubcategoryId = '';
    this.loadServices(true);
  }

  selectSubcategory(id: string): void {
    this.selectedSubcategoryId = this.selectedSubcategoryId === id ? '' : id;
    this.loadServices(true);
  }

  clearFilters(): void {
    this.selectedCategoryId = '';
    this.selectedSubcategoryId = '';
    this.selectedSubcategories = [];
    this.selectedRegion = '';
    this.searchText = '';
    this.sortBy = '';
    this.order = 'desc';
    this.loadServices(true);
  }

  loadServices(resetPage = false): void {
    if (resetPage) this.page = 1;
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.searchText) params.q = this.searchText;
    if (this.selectedCategoryId) params.categoryId = this.selectedCategoryId;
    if (this.selectedSubcategoryId) params.sousCategoryId = this.selectedSubcategoryId;
    if (this.selectedRegion) params.region = this.selectedRegion;
    if (this.sortBy) { params.sortBy = this.sortBy; params.order = this.order; }
    this.serviceService.getServices(params).subscribe({
      next: res => {
        this.services = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.loadServices();
  }

  getImageSrc(path?: string | null): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.apiUrl}${path.startsWith('/uploads/') ? path : '/uploads/' + path}`;
  }
}
