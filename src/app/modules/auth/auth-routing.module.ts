import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OauthCallbackComponent } from './oauth-callback/oauth-callback.component';
import { LogoutPendingComponent } from './logout-pending/logout-pending.component';
import { NoLicenseComponent } from './no-license/no-license.component';

const routes: Routes = [
  { path: '', redirectTo: 'login' },
  { path: 'oauth-callback', component: OauthCallbackComponent },
  { path: 'logout-callback', component: LogoutPendingComponent },
  { path: 'no-license', component: NoLicenseComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
