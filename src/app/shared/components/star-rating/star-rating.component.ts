import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    <span class="star-rating">
      <mat-icon *ngFor="let star of fullStars" class="star filled">star</mat-icon>
      <mat-icon *ngIf="hasHalfStar" class="star half">star_half</mat-icon>
      <mat-icon *ngFor="let star of emptyStars" class="star empty">star_border</mat-icon>
      <span class="rating-text" *ngIf="showValue">{{ rating.toFixed(1) }}</span>
    </span>
  `,
  styles: [`
    .star-rating { display: inline-flex; align-items: center; gap: 1px; }
    .star { font-size: 18px; width: 18px; height: 18px; }
    .star.filled, .star.half { color: #FFC107; }
    .star.empty { color: #E0E0E0; }
    .rating-text { margin-left: 4px; font-size: 14px; font-weight: 600; color: #0f172a; }
  `]
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() showValue = true;

  get fullStars(): number[] { return Array(Math.floor(this.rating)); }
  get hasHalfStar(): boolean { return this.rating % 1 >= 0.5; }
  get emptyStars(): number[] { return Array(5 - Math.ceil(this.rating)); }
}
