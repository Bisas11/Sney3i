import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  // Auth routes (inside public layout for shared header/footer)
  {
    path: 'auth',
    component: PublicLayoutComponent,
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Dashboard routes — Client
  {
    path: 'client',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' },
    loadChildren: () => import('./features/client/client.module').then(m => m.ClientModule)
  },

  // Dashboard routes — Provider
  {
    path: 'provider',
    redirectTo: 'prestataire/dashboard',
    pathMatch: 'full'
  },

  {
    path: 'provider',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'provider' },
    loadChildren: () => import('./features/provider/provider.module').then(m => m.ProviderModule)
  },

  // Dashboard routes — Prestataire
  {
    path: 'prestataire',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'provider' },
    loadChildren: () => import('./features/provider/provider.module').then(m => m.ProviderModule)
  },

  {
    path: 'service-requests',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'provider' },
    loadChildren: () => import('./features/provider/provider.module').then(m => m.ProviderModule)
  },

  // Dashboard routes — Admin
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  // Legacy email link redirect — backend sends /reset-password, frontend route is auth/reset-password
  { path: 'reset-password', redirectTo: 'auth/reset-password', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'client/profile', pathMatch: 'full' },
  { path: 'history', redirectTo: 'client/history', pathMatch: 'full' },
  { path: 'history/:id', redirectTo: 'client/history/:id' },

  // Public routes (with public layout)
  {
    path: '',
    component: PublicLayoutComponent,
    loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule)
  },

  // Fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
