import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';
import { ServiceHistoryComponent } from './service-history/service-history.component';
import { ClientReviewsComponent } from './client-reviews/client-reviews.component';
import { ClientUpgradeComponent } from './client-upgrade/client-upgrade.component';
import { ClientProfileComponent } from './client-profile/client-profile.component';
import { HistoryDetailComponent } from './service-history/history-detail.component';

const routes: Routes = [
  { path: '', component: ClientDashboardComponent },
  { path: 'requests', component: MyRequestsComponent },
  { path: 'history', component: ServiceHistoryComponent },
  { path: 'history/:id', component: HistoryDetailComponent },
  { path: 'reviews', component: ClientReviewsComponent },
  { path: 'upgrade', component: ClientUpgradeComponent },
  { path: 'profile', component: ClientProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule {}
