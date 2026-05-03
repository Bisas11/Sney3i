import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { AppNotification, NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-public-layout',
  template: `
    <header class="site-header" *ngIf="!isAuthRoute">
      <div class="header-inner">
        <a routerLink="/" class="brand">
          <img src="assets/logo.png" alt="Sney3i - صنايعي" class="brand-logo">
        </a>
        <nav class="main-nav">
          <a routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/search" routerLinkActive="active-link">Find Services</a>
        </nav>
        <div class="header-actions">
          <ng-container *ngIf="!auth.isLoggedIn">
            <a routerLink="/auth" class="nav-link">Login</a>
            <a routerLink="/auth" class="btn-primary">Register</a>
          </ng-container>
          <ng-container *ngIf="auth.isLoggedIn">
            <button class="icon-btn" [matMenuTriggerFor]="notifMenu" matTooltip="Notifications">
              <mat-icon [matBadge]="unreadCount > 0 ? unreadCount : null" matBadgeSize="small" matBadgeColor="warn">notifications</mat-icon>
            </button>
            <mat-menu #notifMenu="matMenu" class="notifications-menu">
              <div class="notif-header" (click)="$event.stopPropagation()">
                <strong>Notifications</strong>
                <button mat-button color="primary" (click)="markAllRead()" *ngIf="unreadCount > 0">Mark all read</button>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item *ngFor="let n of notifications" [class.unread]="!n.read" (click)="markAsRead(n)">
                <mat-icon>{{ n.icon }}</mat-icon>
                <div class="notif-content">
                  <span class="notif-text">{{ n.message }}</span>
                  <span class="notif-time">{{ n.time }}</span>
                </div>
              </button>
              <button mat-menu-item *ngIf="notifications.length === 0" disabled>
                <span>No notifications</span>
              </button>
            </mat-menu>
            <div class="user-avatar" [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </div>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item (click)="goToProfile()">
                <mat-icon>person</mat-icon> Profile
              </button>
              <button mat-menu-item (click)="goToHistory()">
                <mat-icon>history</mat-icon> My History
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon> Logout
              </button>
            </mat-menu>
          </ng-container>
        </div>
      </div>
    </header>
    <main class="public-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="site-footer" *ngIf="!isAuthRoute">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="brand">
            <img src="assets/logo-white.png" alt="Sney3i - صنايعي" class="brand-logo footer-logo">
          </div>
          <div class="footer-links">
            <a routerLink="/search">Find a Pro</a>
            <a routerLink="/profile">Join as a Pro</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Sney3i Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent {
  notifications: AppNotification[] = [];
  unreadCount = 0;

  get isAuthRoute(): boolean {
    return this.router.url.startsWith('/auth');
  }

  constructor(
    public auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.notifications = this.notificationService.getNotifications();
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  goToDashboard(): void {
    const role = this.auth.currentUser?.role;
    if (role === 'admin') this.router.navigate(['/admin']);
    else if (role === 'provider' || role === 'prestataire') this.router.navigate(['/prestataire/dashboard']);
    else this.router.navigate(['/search']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }

  goToProfile(): void {
    const role = this.auth.currentUser?.role;
    if (role === 'admin') this.router.navigate(['/admin/users']);
    else if (role === 'provider' || role === 'prestataire') this.router.navigate(['/prestataire/profile']);
    else this.router.navigate(['/profile']);
  }

  goToHistory(): void {
    const role = this.auth.currentUser?.role;
    if (role === 'provider' || role === 'prestataire') this.router.navigate(['/prestataire/missions']);
    else this.router.navigate(['/history']);
  }

  markAsRead(n: AppNotification): void {
    this.notificationService.markAsRead(n.id);
    this.unreadCount = this.notifications.filter(x => !x.read).length;
  }

  markAllRead(): void {
    this.notificationService.markAllRead();
    this.unreadCount = 0;
  }
}
