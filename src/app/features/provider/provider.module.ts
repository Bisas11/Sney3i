import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProviderRoutingModule } from './provider-routing.module';
import { ProviderDashboardComponent } from './provider-dashboard/provider-dashboard.component';
import { IncomingRequestsComponent } from './incoming-requests/incoming-requests.component';
import { ManageServicesComponent } from './manage-services/manage-services.component';
import { ProviderProfileEditComponent } from './provider-profile/provider-profile-edit.component';
import { VerificationComponent } from './verification/verification.component';
import { MissionHistoryComponent } from './mission-history/mission-history.component';
import { ReviewsReceivedComponent } from './reviews-received/reviews-received.component';
import { MissionDetailComponent } from './mission-history/mission-detail.component';

@NgModule({
  declarations: [
    ProviderDashboardComponent,
    IncomingRequestsComponent,
    ManageServicesComponent,
    ProviderProfileEditComponent,
    VerificationComponent,
    MissionHistoryComponent,
    ReviewsReceivedComponent,
    MissionDetailComponent
  ],
  imports: [SharedModule, ProviderRoutingModule]
})
export class ProviderModule {}
