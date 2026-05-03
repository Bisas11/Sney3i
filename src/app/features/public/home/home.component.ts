import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ServiceService } from '../../../core/services/service.service';
import { ServiceCategory } from '../../../shared/models/category.model';
import { Service } from '../../../shared/models/service.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-slider">
          <div *ngFor="let img of heroImages; let i = index"
               class="slide" [class.active]="i === activeSlide"
               [style.backgroundImage]="'url(' + img + ')'"></div>
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <h1>Find the perfect professional for your needs</h1>
          <p>Discover top-rated service providers in your area, verified and ready to help.</p>
          <div class="search-bar">
            <div class="search-field service-field">
              <mat-icon>search</mat-icon>
              <input type="text" [(ngModel)]="searchQuery" placeholder="What service do you need?"
                     (keyup.enter)="search()">
            </div>
            <div class="search-field location-field">
              <mat-icon>location_on</mat-icon>
              <mat-select [(ngModel)]="locationQuery" placeholder="All Regions" class="region-select" panelClass="region-panel">
                <mat-option value="">All Regions</mat-option>
                <mat-option *ngFor="let r of regions" [value]="r">{{ r }}</mat-option>
              </mat-select>
            </div>
            <button class="search-btn" (click)="search()">Search</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Deals -->
    <section class="section providers-section">
      <div class="section-container">
        <h2 class="section-title">Top Deals</h2>
        <p class="section-subtitle">Exclusive offers from our best-rated professionals</p>
        <div class="providers-grid">
        <div *ngFor="let s of featuredServices" class="provider-card">
            <div class="provider-image">
              <img *ngIf="s.image_url" [src]="getImageSrc(s.image_url)" [alt]="s.title" class="service-img">
              <div *ngIf="!s.image_url" class="service-img-placeholder"><mat-icon>home_repair_service</mat-icon></div>
            </div>
            <div class="provider-body">
              <div class="provider-header">
                <div class="provider-avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <div>
                  <h4>{{ s.title }}</h4>
                  <span class="profession">{{ s.prestataire?.name }}</span>
                </div>
              </div>
              <div class="provider-footer">
                <span class="price">{{ s.price }}<span class="unit"> DT</span></span>
                <button class="view-btn" [routerLink]="['/services', s.id]">View Service</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="section how-section">
      <div class="section-container">
        <h2 class="section-title">How It Works</h2>
        <div class="steps-grid">
          <div class="step">
            <div class="step-icon-wrapper">
              <mat-icon>search</mat-icon>
            </div>
            <h3>1. Search</h3>
            <p>Find the service you need from our wide range of categories.</p>
          </div>
          <div class="step">
            <div class="step-icon-wrapper">
              <mat-icon>person_search</mat-icon>
            </div>
            <h3>2. Compare</h3>
            <p>Browse providers, read reviews, and compare prices.</p>
          </div>
          <div class="step">
            <div class="step-icon-wrapper">
              <mat-icon>send</mat-icon>
            </div>
            <h3>3. Book</h3>
            <p>Send a service request to your chosen provider.</p>
          </div>
          <div class="step">
            <div class="step-icon-wrapper">
              <mat-icon>thumb_up</mat-icon>
            </div>
            <h3>4. Done</h3>
            <p>Get the job done and leave a review.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Back to Top -->
    <button class="back-to-top" [class.visible]="showBackToTop" (click)="scrollToTop()">
      <mat-icon>keyboard_arrow_up</mat-icon>
    </button>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {
  searchQuery = '';
  locationQuery = '';
  categories: ServiceCategory[] = [];
  featuredServices: Service[] = [];
  activeSlide = 0;
  showBackToTop = false;
  readonly apiUrl = environment.apiUrl;
  heroImages = [
    'assets/hero-1.jpg',
    'assets/hero-2.jpg',
    'assets/hero-3.jpg'
  ];
  regions = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
    'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Sousse',
    'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
    'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ];
  private slideInterval: any;

  constructor(
    private categoryService: CategoryService,
    private serviceService: ServiceService,
    private router: Router
  ) {
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
    this.serviceService.getServices({ limit: 4, sortBy: 'reviews', order: 'desc' })
      .subscribe(res => this.featuredServices = res.data);
    this.startSlider();
  }

  ngOnDestroy(): void {
    clearInterval(this.slideInterval);
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % this.heroImages.length;
    }, 4000);
  }

  search(): void {
    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery, region: this.locationQuery || undefined } });
  }

  searchByCategory(name: string): void {
    this.router.navigate(['/search'], { queryParams: { category: name } });
  }

  getImageSrc(path?: string | null): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.apiUrl}${path.startsWith('/uploads/') ? path : '/uploads/' + path}`;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;
    this.showBackToTop = scrollTop > (scrollHeight - clientHeight - 300);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
