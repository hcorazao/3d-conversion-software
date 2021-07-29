import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as fromRouterActions from '../actions/router.actions';
import { AuthService } from '../../shared/auth/auth.service';
import { AuthActionTypes, LoginOauth, PermissionsReceived } from '../actions/auth.actions';
import { UserPermissions } from '@app/models/user-permissions.model';

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions, private authService: AuthService) {}

  @Effect()
  logout$ = this.actions$.pipe(
    ofType(AuthActionTypes.logout),
    switchMap(() => {
      this.authService.logout();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  loginRequired$ = this.actions$.pipe(
    ofType(AuthActionTypes.loginRequired),
    map((action: any) => {
      return new LoginOauth();
    })
  );

  @Effect()
  loginOauth$ = this.actions$.pipe(
    ofType(AuthActionTypes.loginOauth),
    switchMap(() => {
      this.authService.startAuthentication();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  getOauthToken$ = this.actions$.pipe(
    ofType(AuthActionTypes.getOauthToken),
    switchMap(() => {
      this.authService.completeAuthentication();
      return of({ type: 'NO_ACTION' });
    })
  );

  @Effect()
  oauthTokenReceived$ = this.actions$.pipe(
    ofType(AuthActionTypes.oauthTokenReceived),
    switchMap((action: any) => {
      const userPermissions = new UserPermissions();
      userPermissions.devToolsUsage = action.payload.user.groups.developer;
      userPermissions.applicationLicense = action.payload.user.validSubscription;
      return [new PermissionsReceived({ userPermissions })];
    })
  );

  @Effect()
  permissionsReceived$ = this.actions$.pipe(
    ofType(AuthActionTypes.permissionsReceived),
    map((action: any) => {
      if (action.payload.userPermissions.applicationLicense) {
        return new fromRouterActions.Go({ path: ['/home'] });
      } else {
        return new fromRouterActions.Go({ path: ['/auth/no-license'] });
      }
    })
  );

  @Effect()
  loggedOut$ = this.actions$.pipe(
    ofType(AuthActionTypes.loggedOut),
    map(() => {
      this.authService.removeUserFromManager();
      return new fromRouterActions.Go({
        path: ['/'],
      });
    })
  );
}
