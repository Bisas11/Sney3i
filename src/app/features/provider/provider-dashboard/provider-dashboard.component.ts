import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-provider-dashboard',
  template: `
    <div class="dashboard-page">
      <h1>Provider Dashboard</h1>
      <p class="subtitle">Here's your activity overview.</p>

      <div class="stats-grid">
        <mat-card class="stat-card new">
          <mat-icon>inbox</mat-icon>
          <div>
            <h3>{{ newRequests }}</h3>
            <p>New Requests</p>
          </div>
        </mat-card>
        <mat-card class="stat-card active">
          <mat-icon>engineering</mat-icon>
          <div>
            <h3>{{ activeMissions }}</h3>
            <p>Active Missions</p>
          </div>
        </mat-card>
        <mat-card class="stat-card completed">
          <mat-icon>done_all</mat-icon>
          <div>
            <h3>{{ completedMissions }}</h3>
            <p>Completed</p>
          </div>
        </mat-card>
        <mat-card class="stat-card rating">
          <mat-icon>star</mat-icon>
          <div>
            <h3>{{ avgRating.toFixed(1) }}</h3>
            <p>Average Rating</p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .subtitle { color: #64748b; margin-bottom: 24px; }
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;
    }
    .stat-card {
      display: flex; align-items: center; gap: 16px; padding: 24px;
      border-radius: 16px !important; border-left: 4px solid;
    }
    .stat-card mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .stat-card h3 { font-size: 28px; font-weight: 700; margin: 0; color: #0f172a; }
    .stat-card p { color: #64748b; margin: 0; font-size: 14px; }
    .stat-card.new { border-color: #FF8F00; } .stat-card.new mat-icon { color: #FF8F00; }
    .stat-card.active { border-color: #0066ff; } .stat-card.active mat-icon { color: #0066ff; }
    .stat-card.completed { border-color: #00C853; } .stat-card.completed mat-icon { color: #00C853; }
    .stat-card.rating { border-color: #6366f1; } .stat-card.rating mat-icon { color: #6366f1; }
  `]
})
export class ProviderDashboardComponent implements OnInit {
  newRequests = 0;
  activeMissions = 0;
  completedMissions = 0;
  avgRating = 0;

  constructor(
    private requestService: RequestService,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.requestService.getMissions().subscribe(reqs => {
      this.newRequests = reqs.filter(r => r.status === 'pending').length;
      this.activeMissions = reqs.filter(r => r.status === 'accepted' || r.status === 'in_progress').length;
      this.completedMissions = reqs.filter(r => r.status === 'done').length;
    });
    const userId = this.authService.currentUser?.id;
    if (userId) {
      this.reviewService.getReviewsByPrestataire(userId).subscribe(reviews => {
        if (reviews.length > 0) {
          this.avgRating = reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length;
        }
      });
    }
  }
}
