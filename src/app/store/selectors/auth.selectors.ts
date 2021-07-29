import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AuthState } from '../states';

export const getAuthStore = createFeatureSelector('auth');

export const isUserLoggedIn = createSelector(
  getAuthStore,
  (authState: AuthState) => authState.loggedIn && authState.user?.expiresAt && authState.user?.expiresAt * 1000 > new Date().getTime()
);
export const getToken = createSelector(getAuthStore, (authState: AuthState) => authState.user?.token);

export const getUserName = createSelector(
  getAuthStore,
  (authState: AuthState) => `${authState.user?.firstName || ''} ${authState.user?.lastName || ''}`
);

export const getUserFirstName = createSelector(getAuthStore, (authState: AuthState) => `${authState.user?.firstName || ''}`);

export const getUserInitials = createSelector(getAuthStore, (authState: AuthState) => {
  const firstNameInitial = authState.user?.firstName?.charAt(0);
  const lastNameInitial = authState.user?.lastName?.charAt(0);
  const emailInitial = authState.user?.email?.charAt(0);
  if (firstNameInitial && lastNameInitial) {
    return `${firstNameInitial}${lastNameInitial}`;
  } else {
    return firstNameInitial || lastNameInitial || emailInitial || ' ';
  }
});

export const getUserEmail = createSelector(getAuthStore, (authState: AuthState) => authState.user?.email);

export const getUserGroups = createSelector(getAuthStore, (authState: AuthState) => authState.user?.groups);

export const getDevToolsUsagePermission = createSelector(getAuthStore, (authState: AuthState) => authState.userPermissions.devToolsUsage);

export const isUserLoggedInWithLicense = createSelector(
  getAuthStore,
  (authState: AuthState) =>
    authState.loggedIn &&
    authState.user?.expiresAt &&
    authState.user?.expiresAt * 1000 > new Date().getTime() &&
    authState.userPermissions.applicationLicense
);
