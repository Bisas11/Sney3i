import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceCategory, ServiceSubcategory } from '../../shared/models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<{ message: string; data: ServiceCategory[] }>(`${this.api}/categories`)
      .pipe(map(res => res.data));
  }

  addCategory(name: string, status = true): Observable<ServiceCategory> {
    return this.http.post<{ message: string; data: ServiceCategory }>(
      `${this.api}/categories`, { name, status }
    ).pipe(map(res => res.data));
  }

  updateCategory(id: string, data: { name?: string; status?: boolean }): Observable<ServiceCategory> {
    return this.http.patch<{ message: string; data: ServiceCategory }>(
      `${this.api}/categories/${id}`, data
    ).pipe(map(res => res.data));
  }

  deleteCategory(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ message: string; data: { deleted: boolean } }>(
      `${this.api}/categories/${id}`
    ).pipe(map(res => res.data));
  }

  addSousCategory(category_id: string, name: string): Observable<ServiceSubcategory> {
    return this.http.post<{ message: string; data: ServiceSubcategory }>(
      `${this.api}/categories/sous-categories`, { category_id, name }
    ).pipe(map(res => res.data));
  }

  updateSousCategory(id: string, name: string): Observable<ServiceSubcategory> {
    return this.http.patch<{ message: string; data: ServiceSubcategory }>(
      `${this.api}/categories/sous-categories/${id}`, { name }
    ).pipe(map(res => res.data));
  }

  deleteSousCategory(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ message: string; data: { deleted: boolean } }>(
      `${this.api}/categories/sous-categories/${id}`
    ).pipe(map(res => res.data));
  }

}
