import { createFeatureSelector, createSelector } from '@ngrx/store';

import { NotificationsState } from '../states';

export const getNotificationsStore = createFeatureSelector('notifications');

export const getToastNotifications = createSelector(
  getNotificationsStore,
  (notificationsState: NotificationsState) => notificationsState.toastNotifications
);

export const getActionNotifications = createSelector(
  getNotificationsStore,
  (notificationsState: NotificationsState) => notificationsState.actionNotifications
);

export const isUploadNotificationDisplayed = createSelector(
  getNotificationsStore,
  (notificationsState: NotificationsState) => notificationsState.uploadNotification.displayed
);

export const isUploadNotificationMinimized = createSelector(
  getNotificationsStore,
  (notificationsState: NotificationsState) => notificationsState.uploadNotification.minimized
);

export const getFreshDentalCasesForNotification = createSelector(
  getNotificationsStore,
  (notificationsState: NotificationsState) => notificationsState.freshDentalCasesForNotification
);

export const getCaseFileUploads = createSelector(
  getNotificationsStore,
  (notificationsState: NotificationsState) => notificationsState.uploadNotification.caseFileUploads
);
