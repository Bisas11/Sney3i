import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthPortalComponent } from './auth-portal.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuthPortalComponent
  ],
  imports: [SharedModule, AuthRoutingModule]
})
export class AuthModule {}
