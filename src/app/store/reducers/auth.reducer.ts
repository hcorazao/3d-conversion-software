import { AuthAction, AuthActionTypes } from './../actions';
import { AuthState } from '../states/auth.states';
import { UserPermissions } from '@app/models/user-permissions.model';

export const initialState: AuthState = {
  user: null,
  loginPending: false,
  loggedIn: false,
  userPermissions: new UserPermissions(),
};

export function reducer(previousState = initialState, action: AuthAction): AuthState {
  switch (action.type) {
    case AuthActionTypes.logout:
      return {
        loginPending: false,
        loggedIn: false,
        user: null,
        userPermissions: new UserPermissions(),
      };
    case AuthActionTypes.loginRequired:
      return {
        ...previousState,
      };
    case AuthActionTypes.loginOauth:
      return {
        loginPending: true,
        loggedIn: false,
        user: null,
        userPermissions: previousState.userPermissions,
      };
    case AuthActionTypes.oauthTokenReceived:
      return {
        loginPending: false,
        loggedIn: true,
        user: {
          ...action.payload.user,
        },
        userPermissions: previousState.userPermissions,
      };
    case AuthActionTypes.permissionsReceived:
      return {
        ...previousState,
        userPermissions: action.payload.userPermissions,
      };
    case AuthActionTypes.loadedUser:
      return {
        ...previousState,
        loggedIn: action.payload.loggedIn,
        user: {
          ...action.payload.user,
        },
      };
    case AuthActionTypes.loggedOut:
      return {
        user: null,
        loggedIn: false,
        loginPending: false,
        userPermissions: new UserPermissions(),
      };

    default:
      return previousState;
  }
}
