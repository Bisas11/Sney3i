import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Service, ServiceListResponse, ServiceDetailResponse } from '../../shared/models/service.model';
import { environment } from '../../../environments/environment';

export interface ServiceQueryParams {
  categoryId?: string;
  sousCategoryId?: string;
  region?: string;
  q?: string;
  sortBy?: 'price' | 'date' | 'reviews';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getServices(params: ServiceQueryParams = {}): Observable<ServiceListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<{ message: string; data: ServiceListResponse }>(
      `${this.api}/services`, { params: httpParams }
    ).pipe(map(res => res.data));
  }

  getServiceById(id: string, query: { page?: number; q?: string } = {}): Observable<ServiceDetailResponse> {
    const params: { [key: string]: string } = {};
    if (query.page) params['page'] = String(query.page);
    if (query.q) params['q'] = query.q;
    return this.http.get<{ message: string; data: ServiceDetailResponse }>(
      `${this.api}/services/${id}`, { params }
    ).pipe(map(res => res.data));
  }

  createService(formData: FormData): Observable<Service> {
    return this.http.post<{ message: string; data: Service }>(
      `${this.api}/services`, formData
    ).pipe(map(res => res.data));
  }

  updateService(id: string, formData: FormData): Observable<Service> {
    return this.http.patch<{ message: string; data: Service }>(
      `${this.api}/services/${id}`, formData
    ).pipe(map(res => res.data));
  }

  getMyServices(): Observable<Service[]> {
    return this.http.get<{ message: string; data: Service[] }>(
      `${this.api}/services/mine`
    ).pipe(map(res => res.data));
  }

  resumeService(id: string): Observable<{ resumed: boolean }> {
    return this.http.patch<{ message: string; data: { resumed: boolean } }>(
      `${this.api}/services/${id}/resume`, {}
    ).pipe(map(res => res.data));
  }

  pauseService(id: string): Observable<{ paused: boolean }> {
    return this.http.delete<{ message: string; data: { paused: boolean } }>(
      `${this.api}/services/${id}`, { params: { mode: 'pause' } }
    ).pipe(map(res => res.data));
  }

  deleteService(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ message: string; data: { deleted: boolean } }>(
      `${this.api}/services/${id}`, { params: { mode: 'delete' } }
    ).pipe(map(res => res.data));
  }
}
