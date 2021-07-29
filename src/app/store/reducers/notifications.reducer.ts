import { NotificationsAction, NotificationsActionType } from './../actions';
import { NotificationsState } from '../states/notifications.state';
import { ToastNotification } from '@app/models/toast-notification.model';
import { ActionNotification } from '@app/models/action-notification.model';
import { CaseFileUploadStatus } from '@app/models/enums/case-file-upload-status.enum';
import { CaseFileUpload } from '@app/models/case-file-upload.model';

export const initialState: NotificationsState = {
  toastNotifications: [],
  actionNotifications: [],
  uploadNotification: {
    displayed: false,
    minimized: false,
    caseFileUploads: [],
  },
  lastNotificationId: 0,
  freshDentalCasesForNotification: [],
};

export function reducer(previousState = initialState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case NotificationsActionType.addToastNotification:
      const toastNotification = action.payload.toastNotification;
      const toastNotificationId = previousState.lastNotificationId + 1;
      return {
        ...previousState,
        toastNotifications: [
          ...previousState.toastNotifications,
          ToastNotification.builder()
            .withId(toastNotificationId)
            .withType(toastNotification.type)
            .withMessageTranslationKey(toastNotification.messageTranslationKey)
            .build(),
        ],
        lastNotificationId: toastNotificationId,
      };
    case NotificationsActionType.dismissToastNotification:
      return {
        ...previousState,
        toastNotifications: [
          ...previousState.toastNotifications.filter((notification) => notification.id !== action.payload.notificationId),
        ],
      };
    case NotificationsActionType.addActionNotification:
      const actionNotification = action.payload.actionNotification;
      const actionNotificationId = previousState.lastNotificationId + 1;
      const newActionNotification = ActionNotification.builder()
        .withId(actionNotificationId)
        .withType(actionNotification.type)
        .withTitleTranslationKey(actionNotification.titleTranslationKey)
        .withDescriptionTranslationKey(actionNotification.descriptionTranslationKey)
        .withActionButtonTitleTranslationKey(actionNotification.actionButtonTitleTranslationKey)
        .build();
      return {
        ...previousState,
        actionNotifications: [...previousState.actionNotifications, newActionNotification],
        lastNotificationId: actionNotificationId,
      };
    case NotificationsActionType.dismissActionNotification:
      return {
        ...previousState,
        actionNotifications: [
          ...previousState.actionNotifications.filter((notification) => notification.id !== action.payload.notificationId),
        ],
      };
    case NotificationsActionType.takeActionNotificationActionByType:
      return {
        ...previousState,
        actionNotifications: [
          ...previousState.actionNotifications.filter((notification) => notification.id !== action.payload.notificationId),
        ],
      };
    case NotificationsActionType.displayUploadNotification:
      return {
        ...previousState,
        uploadNotification: {
          ...previousState.uploadNotification,
          displayed: true,
          caseFileUploads: action.payload.caseFileUploads,
        },
      };
    case NotificationsActionType.dismissUploadNotification:
      return {
        ...previousState,
        uploadNotification: {
          ...previousState.uploadNotification,
          displayed: false,
        },
      };
    case NotificationsActionType.finishUploadingAllInUploadNotification:
      const finishedCaseFileUploads = previousState.uploadNotification.caseFileUploads.map(
        (caseFileUpload) =>
          new CaseFileUpload(caseFileUpload.titleTranslationString, caseFileUpload.fileName, CaseFileUploadStatus.FINISHED_WITH_SUCCESS)
      );
      return {
        ...previousState,
        uploadNotification: {
          ...previousState.uploadNotification,
          caseFileUploads: finishedCaseFileUploads,
        },
      };
    case NotificationsActionType.toggleUploadNotificationMinimization:
      return {
        ...previousState,
        uploadNotification: {
          ...previousState.uploadNotification,
          minimized: !previousState.uploadNotification.minimized,
        },
      };
    case NotificationsActionType.setFreshDentalCasesForNotification:
      return {
        ...previousState,
        freshDentalCasesForNotification: action.payload.freshDentalCases,
      };
    default:
      return previousState;
  }
}
