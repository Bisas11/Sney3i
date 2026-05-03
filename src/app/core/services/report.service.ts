import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Report } from '../../shared/models/report.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Create a report for a service or review (exactly one of service_id / review_id) */
  createReport(target: { service_id?: string; review_id?: string }, comment: string): Observable<Report> {
    return this.http.post<{ message: string; data: Report }>(
      `${this.api}/reports`, { ...target, comment }
    ).pipe(map(res => res.data));
  }

  /** Admin: get all reports, optionally filtered by status */
  getReports(status?: 'unseen' | 'seen'): Observable<Report[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<{ message: string; data: Report[] }>(
      `${this.api}/reports`, { params }
    ).pipe(map(res => res.data));
  }

  /** Admin: mark a report as seen */
  markReportSeen(id: string): Observable<Report> {
    return this.http.patch<{ message: string; data: Report }>(
      `${this.api}/reports/${id}/seen`, {}
    ).pipe(map(res => res.data));
  }
}
