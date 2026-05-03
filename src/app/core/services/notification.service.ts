import { Injectable } from '@angular/core';

export interface AppNotification {
  id: number;
  message: string;
  icon: string;
  time: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications: AppNotification[] = [];

  getNotifications(): AppNotification[] {
    return this.notifications;
  }

  markAsRead(id: number): void {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
  }
}
