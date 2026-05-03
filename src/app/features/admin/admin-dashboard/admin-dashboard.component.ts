import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';
import { AdminService } from '../../../core/services/admin.service';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-page">
      <div class="page-heading">
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Platform overview and management.</p>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card users">
          <mat-icon>people</mat-icon>
          <div>
            <h3>{{ totalUsers }}</h3>
            <p>Total Users</p>
          </div>
        </mat-card>
        <mat-card class="stat-card providers">
          <mat-icon>engineering</mat-icon>
          <div>
            <h3>{{ totalProviders }}</h3>
            <p>Total Providers</p>
          </div>
        </mat-card>
        <mat-card class="stat-card pending">
          <mat-icon>pending_actions</mat-icon>
          <div>
            <h3>{{ pendingApprovals }}</h3>
            <p>Pending Approvals</p>
          </div>
        </mat-card>
        <mat-card class="stat-card reported">
          <mat-icon>flag</mat-icon>
          <div>
            <h3>{{ unseenReports }}</h3>
            <p>Unseen Reports</p>
          </div>
        </mat-card>
      </div>

      <div class="charts-grid">
        <mat-card class="chart-card">
          <mat-card-header>
            <div mat-card-avatar class="chart-icon"><mat-icon>donut_small</mat-icon></div>
            <mat-card-title>User Distribution</mat-card-title>
            <mat-card-subtitle>Clients, providers and admins</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-wrap">
              <canvas baseChart
                [type]="'pie'"
                [data]="roleChartData"
                [options]="pieChartOptions">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <div mat-card-avatar class="chart-icon"><mat-icon>bar_chart</mat-icon></div>
            <mat-card-title>Platform Activity</mat-card-title>
            <mat-card-subtitle>Comparative totals across core objects</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-wrap">
              <canvas baseChart
                [type]="'bar'"
                [data]="activityChartData"
                [options]="barChartOptions">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-heading { margin-bottom: 24px; }
    .dashboard-page h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .subtitle { color: #64748b; margin: 0; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      border-radius: 16px !important;
      border-left: 4px solid;
    }
    .stat-card mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .stat-card h3 { font-size: 28px; font-weight: 700; margin: 0; color: #0f172a; }
    .stat-card p { color: #64748b; margin: 0; font-size: 14px; }
    .stat-card.users { border-color: #076ab8; } .stat-card.users mat-icon { color: #076ab8; }
    .stat-card.providers { border-color: #6366f1; } .stat-card.providers mat-icon { color: #6366f1; }
    .stat-card.pending { border-color: #f59e0b; } .stat-card.pending mat-icon { color: #f59e0b; }
    .stat-card.reported { border-color: #dc2626; } .stat-card.reported mat-icon { color: #dc2626; }
    .charts-grid {
      display: grid;
      grid-template-columns: minmax(280px, .85fr) minmax(320px, 1.15fr);
      gap: 20px;
      align-items: stretch;
    }
    .chart-card { border-radius: 16px !important; min-width: 0; }
    .chart-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: #eff6ff;
      color: #076ab8;
    }
    .chart-icon mat-icon { font-size: 21px; width: 21px; height: 21px; }
    mat-card-title { color: #0f172a; font-size: 17px; font-weight: 700; }
    .chart-wrap {
      position: relative;
      height: 320px;
      width: 100%;
      margin-top: 12px;
    }
    @media (max-width: 960px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .stat-card { padding: 18px; }
      .chart-wrap { height: 280px; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0;
  totalProviders = 0;
  pendingApprovals = 0;
  unseenReports = 0;

  roleChartData: ChartData<'pie', number[], string> = {
    labels: ['Clients', 'Providers', 'Admins'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#076ab8', '#6366f1', '#f59e0b'],
      borderColor: '#ffffff',
      borderWidth: 3
    }]
  };

  activityChartData: ChartData<'bar', number[], string> = {
    labels: ['Services', 'Requests', 'Reviews', 'Unseen Reports'],
    datasets: [{
      label: 'Total',
      data: [0, 0, 0, 0],
      backgroundColor: ['#076ab8', '#2563eb', '#6366f1', '#dc2626'],
      borderRadius: 10,
      maxBarThickness: 56
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 18,
          color: '#64748b',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12
      }
    }
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } }
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: '#64748b', font: { family: 'Inter', size: 12 } },
        grid: { color: '#eef2f7' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12
      }
    }
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    forkJoin({
      users: this.adminService.getUsers(),
      pendingProviders: this.adminService.getPendingPrestataires(),
      unseenReports: this.adminService.getReports('unseen'),
      services: this.adminService.getServices(),
      requests: this.adminService.getServiceRequests(),
      reviews: this.adminService.getReviews()
    }).subscribe(({ users, pendingProviders, unseenReports, services, requests, reviews }) => {
      const clients = users.filter(u => u.role === 'client').length;
      const providers = users.filter(u => u.role === 'provider' || u.role === 'prestataire').length;
      const admins = users.filter(u => u.role === 'admin').length;

      this.totalUsers = users.length;
      this.totalProviders = providers;
      this.pendingApprovals = pendingProviders.length;
      this.unseenReports = unseenReports.length;

      this.roleChartData = {
        ...this.roleChartData,
        datasets: [{
          ...this.roleChartData.datasets[0],
          data: [clients, providers, admins]
        }]
      };

      this.activityChartData = {
        ...this.activityChartData,
        datasets: [{
          ...this.activityChartData.datasets[0],
          data: [services.length, requests.length, reviews.length, unseenReports.length]
        }]
      };
    });
  }
}
