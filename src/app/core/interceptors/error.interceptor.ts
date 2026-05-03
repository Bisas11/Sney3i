import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          this.router.navigate(['/auth']);
        } else if (error.status === 403) {
          const message = error.error?.error?.message || 'Access forbidden';
          this.snackBar.open(message, 'Close', { duration: 5000, panelClass: 'error-snack' });
        }
        return throwError(() => error);
      })
    );
  }
}
