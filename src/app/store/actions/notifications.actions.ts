import { Action } from '@ngrx/store';
import { ActionNotification } from '@app/models/action-notification.model';
import { DentalCaseSimple } from '@app/models/dental-case-simple.model';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { ActionNotificationType } from '@app/models/enums/action-notification-type.enum';
import { ToastNotification } from '@app/models/toast-notification.model';
import { CaseFileUpload } from '@app/models/case-file-upload.model';

export enum NotificationsActionType {
  addToastNotificationByType = '[Notifications] Add Toast Notification By Type',
  addToastNotification = '[Notifications] Add Toast Notification',
  dismissToastNotification = '[Notifications] Dismiss Toast Notification',
  addActionNotificationByType = '[Notifications] Add Action Notification By Type',
  addActionNotification = '[Notifications] Add Action Notification',
  dismissActionNotification = '[Notifications] Dismiss Action Notification',
  takeActionNotificationActionByType = '[Notifications] Take Action Notification Action By Type',
  displayUploadNotification = '[Notifications] Display Upload Notification',
  dismissUploadNotification = '[Notifications] Dismiss Upload Notification',
  finishUploadingAllInUploadNotification = '[Notifications] Finish Uploading All In Upload Notification',
  toggleUploadNotificationMinimization = '[Notifications] Toggle Upload Notification Minimization',
  setFreshDentalCasesForNotification = '[Notifications] Set Fresh Dental Cases For Notification',
}

export class AddToastNotificationByType implements Action {
  readonly type = NotificationsActionType.addToastNotificationByType;
  constructor(public payload: { type: ToastNotificationType }) {}
}

export class AddToastNotification implements Action {
  readonly type = NotificationsActionType.addToastNotification;
  constructor(public payload: { toastNotification: ToastNotification }) {}
}

export class DismissToastNotification implements Action {
  readonly type = NotificationsActionType.dismissToastNotification;
  constructor(public payload: { notificationId: number }) {}
}

export class AddActionNotificationByType implements Action {
  readonly type = NotificationsActionType.addActionNotificationByType;
  constructor(public payload: { type: ActionNotificationType }) {}
}

export class AddActionNotification implements Action {
  readonly type = NotificationsActionType.addActionNotification;
  constructor(public payload: { actionNotification: ActionNotification }) {}
}

export class DismissActionNotification implements Action {
  readonly type = NotificationsActionType.dismissActionNotification;
  constructor(public payload: { notificationId: number }) {}
}

export class TakeActionNotificationActionByType implements Action {
  readonly type = NotificationsActionType.takeActionNotificationActionByType;
  constructor(public payload: { notificationId: number; notificationType: ActionNotificationType }) {}
}

export class DisplayUploadNotification implements Action {
  readonly type = NotificationsActionType.displayUploadNotification;
  constructor(public payload: { caseFileUploads: CaseFileUpload[] }) {}
}

export class DismissUploadNotification implements Action {
  readonly type = NotificationsActionType.dismissUploadNotification;
}

export class FinishUploadingAllInUploadNotification implements Action {
  readonly type = NotificationsActionType.finishUploadingAllInUploadNotification;
}

export class ToggleUploadNotificationMinimization implements Action {
  readonly type = NotificationsActionType.toggleUploadNotificationMinimization;
}

export class SetFreshDentalCasesForNotification implements Action {
  readonly type = NotificationsActionType.setFreshDentalCasesForNotification;
  constructor(public payload: { freshDentalCases: DentalCaseSimple[] }) {}
}

export type NotificationsAction =
  | AddToastNotificationByType
  | AddToastNotification
  | DismissToastNotification
  | AddActionNotificationByType
  | AddActionNotification
  | DismissActionNotification
  | TakeActionNotificationActionByType
  | DisplayUploadNotification
  | DismissUploadNotification
  | FinishUploadingAllInUploadNotification
  | ToggleUploadNotificationMinimization
  | SetFreshDentalCasesForNotification;
