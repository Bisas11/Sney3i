import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { PrestataireProfile } from '../../shared/models/provider.model';
import { Report } from '../../shared/models/report.model';
import { Service } from '../../shared/models/service.model';
import { ServiceRequest } from '../../shared/models/request.model';
import { Review } from '../../shared/models/review.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<{ message: string; data: User[] }>(`${this.api}/admin/users`)
      .pipe(map(res => res.data));
  }

  getPendingPrestataires(): Observable<PrestataireProfile[]> {
    return this.http.get<{ message: string; data: PrestataireProfile[] }>(`${this.api}/admin/prestataires`)
      .pipe(map(res => res.data));
  }

  getServices(): Observable<Service[]> {
    return this.http.get<{ message: string; data: Service[] }>(`${this.api}/admin/services`)
      .pipe(map(res => res.data));
  }

  createService(data: {
    prestataire_id: string;
    title: string;
    description: string;
    price: string;
    sous_category_id?: string;
  }): Observable<Service> {
    return this.http.post<{ message: string; data: Service }>(`${this.api}/admin/services`, data)
      .pipe(map(res => res.data));
  }

  updateService(id: string, data: {
    title?: string;
    description?: string;
    price?: string;
    sous_category_id?: string;
  }): Observable<Service> {
    return this.http.patch<{ message: string; data: Service }>(`${this.api}/admin/services/${id}`, data)
      .pipe(map(res => res.data));
  }

  getServiceRequests(): Observable<ServiceRequest[]> {
    return this.http.get<{ message: string; data: ServiceRequest[] }>(`${this.api}/admin/service-requests`)
      .pipe(map(res => res.data));
  }

  getReviews(): Observable<Review[]> {
    return this.http.get<{ message: string; data: Review[] }>(`${this.api}/admin/reviews`)
      .pipe(map(res => res.data));
  }

  updateUser(id: string, data: { name?: string; phone_number?: string; address?: string; date_of_birth?: string }): Observable<User> {
    return this.http.patch<{ message: string; data: User }>(`${this.api}/admin/users/${id}/data`, data)
      .pipe(map(res => res.data));
  }

  deactivateUser(id: string): Observable<{ active: boolean }> {
    return this.http.patch<{ message: string; data: { active: boolean } }>(`${this.api}/admin/users/${id}/deactivate`, {})
      .pipe(map(res => res.data));
  }

  activateUser(id: string): Observable<{ active: boolean }> {
    return this.http.patch<{ message: string; data: { active: boolean } }>(`${this.api}/admin/users/${id}/activate`, {})
      .pipe(map(res => res.data));
  }

  approvePrestataire(id: string): Observable<any> {
    return this.http.patch<{ message: string; data: any }>(`${this.api}/admin/prestataires/${id}/approve`, {})
      .pipe(map(res => res.data));
  }

  rejectPrestataire(id: string, reason: string): Observable<any> {
    return this.http.patch<{ message: string; data: any }>(`${this.api}/admin/prestataires/${id}/reject`, { reason })
      .pipe(map(res => res.data));
  }

  suspendUser(id: string, reason: string): Observable<any> {
    return this.http.patch<{ message: string; data: any }>(`${this.api}/admin/users/${id}/suspend`, { reason })
      .pipe(map(res => res.data));
  }

  reinstateUser(id: string): Observable<any> {
    return this.http.patch<{ message: string; data: any }>(`${this.api}/admin/users/${id}/reinstate`, {})
      .pipe(map(res => res.data));
  }

  deleteReview(id: string, reason: string): Observable<any> {
    return this.http.delete<{ message: string; data: any }>(`${this.api}/admin/reviews/${id}`, { body: { reason } })
      .pipe(map(res => res.data));
  }

  deleteService(id: string, reason: string): Observable<any> {
    return this.http.delete<{ message: string; data: any }>(`${this.api}/admin/services/${id}`, { body: { reason } })
      .pipe(map(res => res.data));
  }

  getReports(status?: 'unseen' | 'seen'): Observable<Report[]> {
    const params: { [key: string]: string } = {};
    if (status) params['status'] = status;
    return this.http.get<{ message: string; data: Report[] }>(`${this.api}/reports`, { params })
      .pipe(map(res => res.data));
  }

  markReportSeen(id: string): Observable<any> {
    return this.http.patch<{ message: string; data: any }>(`${this.api}/reports/${id}/seen`, {})
      .pipe(map(res => res.data));
  }

  pardonServiceCounter(id: string, amount: number): Observable<{
    pardoned: boolean;
    deleted_service_count: number;
    deleted_review_count: number;
    is_suspended: boolean;
  }> {
    return this.http.patch<{ message: string; data: {
      pardoned: boolean;
      deleted_service_count: number;
      deleted_review_count: number;
      is_suspended: boolean;
    } }>(`${this.api}/admin/users/${id}/pardon/service/${amount}`, {})
      .pipe(map(res => res.data));
  }

  pardonReviewCounter(id: string, amount: number): Observable<{
    pardoned: boolean;
    deleted_service_count: number;
    deleted_review_count: number;
    is_suspended: boolean;
  }> {
    return this.http.patch<{ message: string; data: {
      pardoned: boolean;
      deleted_service_count: number;
      deleted_review_count: number;
      is_suspended: boolean;
    } }>(`${this.api}/admin/users/${id}/pardon/review/${amount}`, {})
      .pipe(map(res => res.data));
  }
}
