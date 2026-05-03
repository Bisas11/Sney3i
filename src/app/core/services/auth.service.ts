import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser && !!localStorage.getItem('token');
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<{ message: string; data: { access_token: string } }>(
      `${this.api}/auth/login`, { email, password }
    ).pipe(
      tap(res => localStorage.setItem('token', res.data.access_token)),
      switchMap(() => this.fetchAndStoreProfile())
    );
  }

  register(name: string, email: string, password: string): Observable<{ id: string; email: string; name: string }> {
    return this.http.post<{ message: string; data: { id: string; email: string; name: string } }>(
      `${this.api}/auth/register`, { name, email, password }
    ).pipe(map(res => res.data));
  }

  verifyEmail(token: string): Observable<User> {
    return this.http.get<{ message: string; data: { verified: boolean; access_token?: string } }>(
      `${this.api}/auth/verify-email`, { params: { token } }
    ).pipe(
      tap(res => {
        if (res.data.access_token) {
          localStorage.setItem('token', res.data.access_token);
        }
      }),
      switchMap(() => this.fetchAndStoreProfile())
    );
  }

  forgotPassword(email: string): Observable<{ sent: boolean }> {
    return this.http.post<{ message: string; data: { sent: boolean } }>(
      `${this.api}/auth/forgot-password`, { email }
    ).pipe(map(res => res.data));
  }

  resetPassword(token: string, password: string): Observable<{ updated: boolean }> {
    return this.http.post<{ message: string; data: { updated: boolean } }>(
      `${this.api}/auth/reset-password`, { token, password }
    ).pipe(map(res => res.data));
  }

  getProfile(): Observable<User> {
    return this.fetchAndStoreProfile();
  }

  updateProfile(data: { name?: string; phone_number?: string; date_of_birth?: string; address?: string }): Observable<User> {
    return this.http.patch<{ message: string; data: User }>(
      `${this.api}/users/me/data`, data
    ).pipe(
      map(res => this.mapRole(res.data)),
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  updatePassword(current_password: string, new_password: string): Observable<{ updated: boolean }> {
    return this.http.patch<{ message: string; data: { updated: boolean } }>(
      `${this.api}/users/me/password`, { current_password, new_password }
    ).pipe(map(res => res.data));
  }

  updateImage(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.patch<{ message: string; data: User }>(
      `${this.api}/users/me/image`, formData
    ).pipe(
      map(res => this.mapRole(res.data)),
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  private fetchAndStoreProfile(): Observable<User> {
    return this.http.get<{ message: string; data: User }>(`${this.api}/users/me`).pipe(
      map(res => this.mapRole(res.data)),
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  private mapRole(user: any): User {
    return {
      ...user,
      role: user.role === 'prestataire' ? 'provider' : user.role
    } as User;
  }
}
