import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '@app/models/user.model';

import { environment } from '@environments/environment';
import { UserManager, UserManagerSettings } from 'oidc-client';
import { Store } from '@ngrx/store';
import { OauthTokenReceived, LoadedUser, PermissionsReceived } from '@app/store/actions/auth.actions';
import { UserPermissions } from '@app/models/user-permissions.model';
import { IndexedDbStorageService, machineIdIdbKey } from '@app/shared/services/indexed-db-storage.service';
import * as uuid from 'uuid';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userManagerSettings: UserManagerSettings = {
    authority: environment.oauth.authority,
    client_id: environment.oauth.clientId,
    redirect_uri: `${window.location.origin}${environment.oauth.loginCallbackUrlSuffix}`,
    post_logout_redirect_uri: `${window.location.origin}${environment.oauth.logoutCallbackUrlSuffix}`,
    response_type: 'code',
    scope: `${environment.oauth.clientId} openid profile email`,
    filterProtocolClaims: true,
    loadUserInfo: false,
    revokeAccessTokenOnSignout: true,
    metadataUrl: `${environment.oauth.authority}${environment.oauth.wellKnownUrlSuffix}`,
    metadata: {
      jwks_uri: `${environment.oauth.authority}${environment.oauth.jwksUrlSuffix}`,
      issuer: environment.oauth.issuer,
      authorization_endpoint: `${environment.oauth.authority}${environment.oauth.loginUrlSuffix}`,
      token_endpoint: `${environment.oauth.authority}${environment.oauth.tokenUrlSuffix}`,
      end_session_endpoint: `${environment.oauth.authority}${environment.oauth.endSessionUrlPart}${environment.oauth.clientId}`,
    },
  };

  private manager = new UserManager(this.userManagerSettings);

  constructor(private http: HttpClient, private store: Store, private indexedDbStorageService: IndexedDbStorageService) {
    this.manager.getUser().then((user) => {
      this.store.dispatch(new LoadedUser({ user: User.createFromTokenMessage(user), loggedIn: !!user && !user.expired }));
    });
  }

  startAuthentication(): Promise<void> {
    return this.manager.signinRedirect();
  }

  completeAuthentication(): Promise<void> {
    return this.manager
      .signinRedirectCallback()
      .then(async (response) => {
        const user = User.createFromTokenMessage(response);
        this.store.dispatch(new OauthTokenReceived({ user }));
      })
      .catch(() => {
        this.startAuthentication();
      });
  }

  logout() {
    this.manager.signoutRedirect();
  }

  removeUserFromManager() {
    this.manager.removeUser();
  }
}
