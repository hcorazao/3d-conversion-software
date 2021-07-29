import { Injectable } from '@angular/core';
import { ProfilePreferences } from '@app/models/profile-preferences.model';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { AddToastNotification } from '@app/store/actions/notifications.actions';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { ToastNotification } from '@app/models/toast-notification.model';
import { take } from 'rxjs/operators';

const IMPORT_FOLDER_NOT_FOUND_ERROR_MESSAGE = 'A requested file or directory could not be found at the time an operation was processed.';

@Injectable({
  providedIn: 'root',
})
export class ResultExportService {
  profilePreferences$: Observable<ProfilePreferences>;

  constructor(private store: Store) {}

  public exportFileToExportFolder(file: File): any {
    this.store.pipe(select(fromSelectors.getProfilePreferences), take(1)).subscribe((preferences) => {
      if (preferences.exportFolder) {
        this.exportFile(file, preferences.exportFolder, ToastNotificationType.CASE_EXPORTED_TO_FOLDER_SUCCESSFULLY);
      } else {
        this.displayMessage('exportFolder.errors.defaultFolderNotSet');
      }
    });
  }

  public exportFileToCaseFolderLocation(file: File, folderHandle: FileSystemDirectoryHandle): any {
    this.exportFile(file, folderHandle, ToastNotificationType.FILE_EXPORTED_TO_CASE_FOLDER_LOCATION_SUCCESSFULLY);
  }

  private exportFile(file: File, folderHandle: FileSystemDirectoryHandle, notificationTypeOnSuccess: ToastNotificationType): any {
    this.verifyPermission(folderHandle).then((permissionGranted) => {
      if (permissionGranted) {
        this.saveFileToFolderHandle(file, folderHandle, notificationTypeOnSuccess);
      } else {
        this.displayMessage('exportFolder.errors.permissionNotGranted');
      }
    });
  }

  private async verifyPermission(handle) {
    const opts = { mode: 'readwrite' };
    if ((await handle.queryPermission(opts)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(opts)) === 'granted') {
      return true;
    }
    return false;
  }

  private saveFileToFolderHandle(file: File, folderHandle: FileSystemDirectoryHandle, notificationTypeOnSuccess: ToastNotificationType) {
    folderHandle
      .getFileHandle(file.name, { create: true })
      .then((fileHandle) => {
        fileHandle.createWritable().then((writable) => {
          writable.write(file).then(() => {
            writable.close();
            // this.store.dispatch(new AddToastNotificationByType({ type: notificationTypeOnSuccess }));
          });
        });
      })
      .catch((error) => {
        if (error.message === IMPORT_FOLDER_NOT_FOUND_ERROR_MESSAGE) {
          this.displayMessage('exportFolder.errors.folderNotFound');
        } else {
          this.displayMessage('exportFolder.errors.unknownError');
        }
      });
  }

  private displayMessage(messageTranslationKey) {
    const toastNotification = ToastNotification.builder().withMessageTranslationKey(messageTranslationKey).build();
    this.store.dispatch(new AddToastNotification({ toastNotification }));
  }
}
