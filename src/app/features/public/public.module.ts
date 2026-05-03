import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { ProviderProfileComponent } from './provider-profile/provider-profile.component';

@NgModule({
  declarations: [HomeComponent, SearchComponent, ProviderProfileComponent],
  imports: [SharedModule, PublicRoutingModule]
})
export class PublicModule {}
