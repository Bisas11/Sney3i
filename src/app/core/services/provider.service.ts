import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrestataireProfile } from '../../shared/models/provider.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<PrestataireProfile> {
    return this.http.get<{ message: string; data: PrestataireProfile }>(
      `${this.api}/prestataires/me/profile`
    ).pipe(map(res => res.data));
  }

  updateMyProfile(data: { title?: string; bio?: string }): Observable<PrestataireProfile> {
    return this.http.patch<{ message: string; data: PrestataireProfile }>(
      `${this.api}/prestataires/me/profile`, data
    ).pipe(map(res => res.data));
  }

  /** Submit or update a prestataire application (multipart form) */
  applyAsPrestataire(formData: FormData): Observable<{ mode: string; profile: PrestataireProfile }> {
    return this.http.post<{ message: string; data: { mode: string; profile: PrestataireProfile } }>(
      `${this.api}/prestataires/application`, formData
    ).pipe(map(res => res.data));
  }

  /** Admin: get all pending prestataire applications */
  getPendingApplications(): Observable<PrestataireProfile[]> {
    return this.http.get<{ message: string; data: PrestataireProfile[] }>(
      `${this.api}/admin/prestataires`
    ).pipe(map(res => res.data));
  }

  /** Admin: approve a prestataire application */
  approveProvider(id: string): Observable<{ approved: boolean }> {
    return this.http.patch<{ message: string; data: { approved: boolean } }>(
      `${this.api}/admin/prestataires/${id}/approve`, {}
    ).pipe(map(res => res.data));
  }

  /** Admin: reject a prestataire application */
  rejectProvider(id: string, reason: string): Observable<{ rejected: boolean }> {
    return this.http.patch<{ message: string; data: { rejected: boolean } }>(
      `${this.api}/admin/prestataires/${id}/reject`, { reason }
    ).pipe(map(res => res.data));
  }
}
