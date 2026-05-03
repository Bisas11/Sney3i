import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ClientRoutingModule } from './client-routing.module';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';
import { ServiceHistoryComponent } from './service-history/service-history.component';
import { ClientReviewsComponent } from './client-reviews/client-reviews.component';
import { ClientUpgradeComponent } from './client-upgrade/client-upgrade.component';
import { ClientProfileComponent } from './client-profile/client-profile.component';
import { HistoryDetailComponent } from './service-history/history-detail.component';

@NgModule({
  declarations: [
    ClientDashboardComponent,
    MyRequestsComponent,
    ServiceHistoryComponent,
    ClientReviewsComponent,
    ClientUpgradeComponent,
    ClientProfileComponent,
    HistoryDetailComponent
  ],
  imports: [SharedModule, ClientRoutingModule]
})
export class ClientModule {}
