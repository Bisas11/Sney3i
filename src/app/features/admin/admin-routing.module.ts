import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProviderValidationComponent } from './provider-validation/provider-validation.component';
import { ManageCategoriesComponent } from './manage-categories/manage-categories.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ModerateReviewsComponent } from './moderate-reviews/moderate-reviews.component';
import { AdminServicesComponent } from './admin-services.component';
import { AdminRequestsComponent } from './admin-requests.component';
import { AdminReviewsComponent } from './admin-reviews.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'validate', component: ProviderValidationComponent },
  { path: 'services', component: AdminServicesComponent },
  { path: 'requests', component: AdminRequestsComponent },
  { path: 'reviews', component: AdminReviewsComponent },
  { path: 'categories', component: ManageCategoriesComponent },
  { path: 'users', component: ManageUsersComponent },
  { path: 'reports', component: ModerateReviewsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
