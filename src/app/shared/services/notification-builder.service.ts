import { Injectable } from '@angular/core';
import { ToastNotificationType } from '../../models/enums/toast-notification-type.enum';
import { ActionNotificationType } from '../../models/enums/action-notification-type.enum';
import { ActionNotification } from '@app/models/action-notification.model';
import { ToastNotification } from '@app/models/toast-notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationBuilderService {
  constructor() {}

  createToastNotificationByType(toastNotificationType: ToastNotificationType): ToastNotification {
    return ToastNotification.builder()
      .withType(toastNotificationType)
      .withMessageTranslationKey(this.getMessageTranslationKeyByToastNotificationType(toastNotificationType))
      .build();
  }
  private getMessageTranslationKeyByToastNotificationType(toastNotificationType: ToastNotificationType): string {
    switch (toastNotificationType) {
      case ToastNotificationType.IMPORTING_FILE_INSTEAD_OF_FOLDER_ERROR:
        return 'notification.toast.importingFileInsteadOfFolderError.message';
      case ToastNotificationType.CASE_IMPORTED_SUCCESSFULLY:
        return 'notification.toast.caseImportedSuccessfully.message';
      case ToastNotificationType.CASE_EXPORTED_TO_FOLDER_SUCCESSFULLY:
        return 'notification.toast.caseExportedToFolderSuccessfully.message';
      case ToastNotificationType.CASE_EXPORTED_TO_DRIVE_SUCCESSFULLY:
        return 'notification.toast.caseExportedToDriveSuccessfully.message';
      case ToastNotificationType.CASE_EXPORTED_TO_DISK_SUCCESSFULLY:
        return 'notification.toast.caseExportedToDiskSuccessfully.message';
      case ToastNotificationType.FILE_EXPORTED_TO_CASE_FOLDER_LOCATION_SUCCESSFULLY:
        return 'notification.toast.fileExportedToCaseFolderLocationSuccessfully.message';
      case ToastNotificationType.DESIGN_PARAMETERS_UPDATED_SUCCESSFULLY:
        return 'notification.toast.designParametersUpdateSuccessfully.message';
      case ToastNotificationType.PROFILE_DETAILS_UPDATED_SUCCESSFULLY:
        return 'notification.toast.profileDetailsUpdatedSuccessfully.message';
      case ToastNotificationType.CASE_NAME_UDATED_SUCCESSFULLY:
        return 'notification.toast.caseNameUpdatedSuccessfully.message';
      case ToastNotificationType.CASE_DELETED_SUCCESSFULLY:
        return 'notification.toast.caseDeletedSuccessfully.message';
      case ToastNotificationType.AVATAR_UPDATED_SUCCESSFULLY:
        return 'notification.toast.avatarUpdatedSuccessfully.message';
      case ToastNotificationType.PASSWORD_UPDATED_SUCCESSFULLY:
        return 'notification.toast.passwordUpdatedSuccessfully.message';
      case ToastNotificationType.EMAIL_UPDATED_SUCCESSFULLY:
        return 'notification.toast.emailUpdatedSuccessfully.message';
      case ToastNotificationType.SELECTED_DENTAL_CASE_NOT_FOUND_IN_IMPORT_FOLDER_ERROR:
        return 'notification.toast.selectedDentalCaseNotFoundInImportFolderError.message';
      case ToastNotificationType.PERMISSION_TO_FOLDER_NOT_GRANTED_ERROR:
        return 'notification.toast.permissionToFolderNotGrantedError.message';
      case ToastNotificationType.CANNOT_START_NEW_CASE_AFTER_RESTART_ERROR:
        return 'notification.toast.cannotStartNewCaseAfterRestartError.message';
      case ToastNotificationType.SIDEBAR_PATIENT_ID_COPIED_SUCCESSFULLY:
        return 'notification.toast.sidebarPatientIdCopiedSuccessfully.message';
      default:
        return undefined;
    }
  }

  createActionNotificationByType(actionNotificationType: ActionNotificationType): ActionNotification {
    switch (actionNotificationType) {
      case ActionNotificationType.INSTALL_APP:
        return ActionNotification.builder()
          .withType(actionNotificationType)
          .withTitleTranslationKey('notification.action.installApp.title')
          .withDescriptionTranslationKey('notification.action.installApp.description')
          .withActionButtonTitleTranslationKey('notification.action.installApp.actionButton.title')
          .build();
      case ActionNotificationType.SET_PARAMETERS:
        return ActionNotification.builder()
          .withType(actionNotificationType)
          .withTitleTranslationKey('notification.action.setParameters.title')
          .withDescriptionTranslationKey('notification.action.setParameters.description')
          .withActionButtonTitleTranslationKey('notification.action.setParameters.actionButton.title')
          .build();
      case ActionNotificationType.SET_PREFERENCES:
        return ActionNotification.builder()
          .withType(actionNotificationType)
          .withTitleTranslationKey('notification.action.setPreferences.title')
          .withDescriptionTranslationKey('notification.action.setPreferences.description')
          .withActionButtonTitleTranslationKey('notification.action.setPreferences.actionButton.title')
          .build();
      case ActionNotificationType.COMPLETE_PROFILE:
        return ActionNotification.builder()
          .withType(actionNotificationType)
          .withTitleTranslationKey('notification.action.completeProfile.title')
          .withDescriptionTranslationKey('notification.action.completeProfile.description')
          .withActionButtonTitleTranslationKey('notification.action.completeProfile.actionButton.title')
          .build();
    }
  }
}
