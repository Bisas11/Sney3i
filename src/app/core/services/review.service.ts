import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Review } from '../../shared/models/review.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Get all reviews for a prestataire by their user ID */
  getReviewsByPrestataire(prestataireId: string): Observable<Review[]> {
    return this.http.get<{ message: string; data: Review[] }>(
      `${this.api}/reviews/prestataire/${prestataireId}`
    ).pipe(map(res => res.data));
  }

  /** Client: submit a review for a completed service request */
  createReview(service_request_id: string, score: number, commentaire?: string): Observable<Review> {
    return this.http.post<{ message: string; data: Review }>(
      `${this.api}/reviews`, { service_request_id, score, commentaire }
    ).pipe(map(res => res.data));
  }
}
