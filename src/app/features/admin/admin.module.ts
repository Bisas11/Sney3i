import { NgModule } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProviderValidationComponent } from './provider-validation/provider-validation.component';
import { ManageCategoriesComponent } from './manage-categories/manage-categories.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ModerateReviewsComponent } from './moderate-reviews/moderate-reviews.component';
import { AdminServicesComponent } from './admin-services.component';
import { AdminRequestsComponent } from './admin-requests.component';
import { AdminReviewsComponent } from './admin-reviews.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    ProviderValidationComponent,
    ManageCategoriesComponent,
    ManageUsersComponent,
    ModerateReviewsComponent,
    AdminServicesComponent,
    AdminRequestsComponent,
    AdminReviewsComponent
  ],
  imports: [SharedModule, NgChartsModule, AdminRoutingModule]
})
export class AdminModule {}
