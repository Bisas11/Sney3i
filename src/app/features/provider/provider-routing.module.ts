import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderDashboardComponent } from './provider-dashboard/provider-dashboard.component';
import { IncomingRequestsComponent } from './incoming-requests/incoming-requests.component';
import { ManageServicesComponent } from './manage-services/manage-services.component';
import { ProviderProfileEditComponent } from './provider-profile/provider-profile-edit.component';
import { VerificationComponent } from './verification/verification.component';
import { MissionHistoryComponent } from './mission-history/mission-history.component';
import { ReviewsReceivedComponent } from './reviews-received/reviews-received.component';
import { MissionDetailComponent } from './mission-history/mission-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ProviderDashboardComponent },
  { path: 'requests', component: IncomingRequestsComponent },
  { path: 'services', component: ManageServicesComponent },
  { path: 'profile', component: ProviderProfileEditComponent },
  { path: 'verification', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'history', redirectTo: 'missions', pathMatch: 'full' },
  { path: 'missions', component: MissionHistoryComponent },
  { path: 'missions/:id', component: MissionDetailComponent },
  { path: 'reviews', component: ReviewsReceivedComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule {}
