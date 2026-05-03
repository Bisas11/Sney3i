import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceRequest, ServiceRequestStatus } from '../../shared/models/request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Client: get all service request history */
  getClientHistory(): Observable<ServiceRequest[]> {
    return this.http.get<{ message: string; data: ServiceRequest[] }>(
      `${this.api}/service-requests/history`
    ).pipe(map(res => res.data));
  }

  /** Client: get a single history item */
  getClientHistoryById(id: string): Observable<ServiceRequest> {
    return this.http.get<{ message: string; data: ServiceRequest }>(
      `${this.api}/service-requests/history/${id}`
    ).pipe(map(res => res.data));
  }

  /** Provider: get all missions */
  getMissions(): Observable<ServiceRequest[]> {
    return this.http.get<{ message: string; data: ServiceRequest[] }>(
      `${this.api}/service-requests/missions`
    ).pipe(map(res => res.data));
  }

  /** Provider: get a single mission */
  getMissionById(id: string): Observable<ServiceRequest> {
    return this.http.get<{ message: string; data: ServiceRequest }>(
      `${this.api}/service-requests/missions/${id}`
    ).pipe(map(res => res.data));
  }

  /** Client: create a new service request */
  createRequest(service_id: string, client_message?: string): Observable<ServiceRequest> {
    return this.http.post<{ message: string; data: ServiceRequest }>(
      `${this.api}/service-requests`, { service_id, client_message }
    ).pipe(map(res => res.data));
  }

  /** Client / Provider: transition request to a new status */
  transitionStatus(id: string, status: ServiceRequestStatus): Observable<ServiceRequest> {
    return this.http.patch<{ message: string; data: ServiceRequest }>(
      `${this.api}/service-requests/${id}/transition`, { status }
    ).pipe(map(res => res.data));
  }
}
