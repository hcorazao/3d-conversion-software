import { ToastNotification } from '@app/models/toast-notification.model';
import { ActionNotification } from '@app/models/action-notification.model';
import { DentalCaseSimple } from '@app/models/dental-case-simple.model';
import { CaseFileUpload } from '@app/models/case-file-upload.model';

export interface NotificationsState {
  toastNotifications: ToastNotification[];
  actionNotifications: ActionNotification[];
  uploadNotification: {
    displayed: boolean;
    minimized: boolean;
    caseFileUploads: CaseFileUpload[];
  };
  lastNotificationId: number;
  freshDentalCasesForNotification: DentalCaseSimple[];
}
