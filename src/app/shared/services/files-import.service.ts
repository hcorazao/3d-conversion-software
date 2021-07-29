import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastNotification } from '@app/models/toast-notification.model';
import { AddToastNotification } from '@app/store/actions/notifications.actions';
import { CaseAdditionalFileImported } from '@app/store/actions/babylon.actions';
import { CaseAdditionalFileImportError } from '@app/models/enums/case-additional-file-import-error.enum';

@Injectable({
  providedIn: 'root',
})
export class FilesImportService {
  constructor(private store: Store) {}

  public importFileWithNameFromFolderHandle(fileName: string, folderHandle: FileSystemDirectoryHandle) {
    this.verifyReadWritePermissions(folderHandle).then((permissionGranted) => {
      if (permissionGranted) {
        this.getRawFolderContent(folderHandle)
          .then((rawDentalCaseFolders) => {
            const files = rawDentalCaseFolders[0] ? rawDentalCaseFolders[0].files : [];
            const filesToImport = files.filter((file) => file.name === fileName);
            if (filesToImport.length > 0) {
              this.store.dispatch(new CaseAdditionalFileImported({ fileName, file: filesToImport[0], error: null }));
            } else {
              this.store.dispatch(
                new CaseAdditionalFileImported({
                  fileName,
                  file: null,
                  error: CaseAdditionalFileImportError.FILENAME_NOT_FOUND_IN_CASE_FOLDER_LOCATION,
                })
              );
            }
          })
          .catch(() => {
            this.handleError('importFolder.errors.unknownError');
          });
      } else {
        this.handleError('importFolder.errors.permissionNotGranted');
      }
    });
  }

  public async verifyReadWritePermissions(handle) {
    const opts = { mode: 'readwrite' };
    if ((await handle.queryPermission(opts)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(opts)) === 'granted') {
      return true;
    }
    return false;
  }

  public async getRawFolderContent(handle, checkSubDirectories: boolean = true) {
    let dentalCases = [];
    const dentalCase = {
      folderName: handle.name,
      childDirectoriesNumber: 0,
      files: [],
      folderHandle: handle,
    };
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        if (checkSubDirectories) {
          dentalCase.childDirectoriesNumber++;
          const newDirectoryHandle = await handle.getDirectoryHandle(entry.name, {
            create: false,
          });
          const subfolderDentalCases = await this.getRawFolderContent(newDirectoryHandle);
          dentalCases = dentalCases.concat(subfolderDentalCases);
        }
      } else {
        const fileHandle = await handle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        dentalCase.files.push(file);
      }
    }
    dentalCases.push(dentalCase);
    return dentalCases;
  }

  private handleError(messageTranslationKey) {
    const toastNotification = ToastNotification.builder().withMessageTranslationKey(messageTranslationKey).build();
    this.store.dispatch(new AddToastNotification({ toastNotification }));
  }
}
