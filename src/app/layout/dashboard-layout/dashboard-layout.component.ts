import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { AppNotification, NotificationService } from '../../core/services/notification.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  template: `
    <mat-sidenav-container class="dashboard-container">
      <mat-sidenav #sidenav mode="side" opened class="dashboard-sidenav">
        <a routerLink="/search" class="sidenav-brand">
          <img src="assets/logo.png" alt="Sney3i" class="sidenav-logo">
        </a>
        <!-- User profile section -->
        <div class="sidenav-profile">
          <div class="profile-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <div class="profile-info">
            <span class="profile-name">{{ auth.currentUser?.name || 'User' }}</span>
            <span class="profile-email">{{ auth.currentUser?.email }}</span>
          </div>
        </div>
        <mat-divider></mat-divider>
        <mat-nav-list>
          <a mat-list-item *ngFor="let item of navItems" [routerLink]="item.route"
             routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-spacer"></div>
        <mat-divider></mat-divider>
        <mat-nav-list class="bottom-nav">
          <a mat-list-item routerLink="/search">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Back to Search</span>
          </a>
          <a mat-list-item (click)="logout()" style="cursor:pointer">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Logout</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="dashboard-content">
        <mat-toolbar color="primary" class="dashboard-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <a routerLink="/search" class="toolbar-logo-link">
            <img src="assets/logo.png" alt="Sney3i" class="toolbar-logo">
          </a>
          <span class="spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="notifMenu" matTooltip="Notifications">
            <mat-icon [matBadge]="unreadCount > 0 ? unreadCount : null" matBadgeColor="warn">notifications</mat-icon>
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
          <div class="toolbar-avatar" [matMenuTriggerFor]="profileMenu">
            <mat-icon>account_circle</mat-icon>
          </div>
          <mat-menu #profileMenu="matMenu">
            <button mat-menu-item routerLink="/search">
              <mat-icon>home</mat-icon> Home
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon> Logout
            </button>
          </mat-menu>
        </mat-toolbar>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  navItems: NavItem[] = [];
  notifications: AppNotification[] = [];
  unreadCount = 0;

  constructor(
    public auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.notifications = this.notificationService.getNotifications();
    this.unreadCount = this.notifications.filter(n => !n.read).length;

    const role = this.auth.currentUser?.role;
    if (role === 'client') {
      this.navItems = [
        { label: 'Find Services', icon: 'search', route: '/search' },
        { label: 'Profile', icon: 'person', route: '/profile' },
        { label: 'Dashboard', icon: 'dashboard', route: '/client' },
        { label: 'My Requests', icon: 'assignment', route: '/client/requests' },
        { label: 'My History', icon: 'history', route: '/history' },
        { label: 'My Reviews', icon: 'rate_review', route: '/client/reviews' },
        { label: 'Upgrade to Provider', icon: 'verified', route: '/client/upgrade' }
      ];
    } else if (role === 'provider' || role === 'prestataire') {
      this.navItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/prestataire/dashboard' },
        { label: 'Incoming Requests', icon: 'inbox', route: '/prestataire/requests' },
        { label: 'My Services', icon: 'build', route: '/prestataire/services' },
        { label: 'Profile', icon: 'person', route: '/prestataire/profile' },
        { label: 'Missions', icon: 'history', route: '/prestataire/missions' },
        { label: 'My Reviews', icon: 'star', route: '/prestataire/reviews' }
      ];
    } else if (role === 'admin') {
      this.navItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/admin' },
        { label: 'Provider Validation', icon: 'verified_user', route: '/admin/validate' },
        { label: 'Services', icon: 'home_repair_service', route: '/admin/services' },
        { label: 'Requests', icon: 'assignment', route: '/admin/requests' },
        { label: 'Reviews', icon: 'rate_review', route: '/admin/reviews' },
        { label: 'Categories', icon: 'category', route: '/admin/categories' },
        { label: 'Users', icon: 'people', route: '/admin/users' },
        { label: 'Reports', icon: 'flag', route: '/admin/reports' }
      ];
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth']);
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
