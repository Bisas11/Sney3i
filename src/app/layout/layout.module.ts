import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';

@NgModule({
  declarations: [PublicLayoutComponent, DashboardLayoutComponent],
  imports: [SharedModule],
  exports: [PublicLayoutComponent, DashboardLayoutComponent]
})
export class LayoutModule {}
