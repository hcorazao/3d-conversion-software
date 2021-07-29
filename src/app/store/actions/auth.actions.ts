import { Action } from '@ngrx/store';
import { User } from '@app/models/user.model';
import { UserPermissions } from '@app/models/user-permissions.model';

export enum AuthActionTypes {
  logout = '[Auth] Logout',
  loginRequired = '[Auth] Login Required',
  loginOauth = '[Auth] Login Oauth',
  getOauthToken = '[Auth] Get Oauth Token',
  oauthTokenReceived = '[Auth] Oauth Token Received',
  permissionsReceived = '[Auth] Permissions Received',
  loadedUser = '[Auth] Loaded User',
  loggedOut = '[Auth] Logged Out',
}

export class Logout implements Action {
  readonly type = AuthActionTypes.logout;
}
export class LoginRequired implements Action {
  readonly type = AuthActionTypes.loginRequired;
  constructor(public payload: { returnUrl?: string }) {}
}
export class LoginOauth implements Action {
  readonly type = AuthActionTypes.loginOauth;
}
export class GetOauthToken implements Action {
  readonly type = AuthActionTypes.getOauthToken;
}
export class OauthTokenReceived implements Action {
  readonly type = AuthActionTypes.oauthTokenReceived;
  constructor(public payload: { user: User }) {}
}
export class PermissionsReceived implements Action {
  readonly type = AuthActionTypes.permissionsReceived;
  constructor(public payload: { userPermissions: UserPermissions }) {}
}
export class LoadedUser implements Action {
  readonly type = AuthActionTypes.loadedUser;
  constructor(public payload: { user: User; loggedIn: boolean }) {}
}
export class LoggedOut implements Action {
  readonly type = AuthActionTypes.loggedOut;
}

export type AuthAction =
  | Logout
  | LoginRequired
  | LoginOauth
  | GetOauthToken
  | OauthTokenReceived
  | PermissionsReceived
  | LoadedUser
  | LoggedOut;
