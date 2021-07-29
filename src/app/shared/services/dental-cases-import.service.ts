import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { CaseLoadersManagerService } from '@app/modules/layout/services/case-loaders/case-loaders-manager.service';
import {
  CasesImportedFromImportFolder,
  ErrorImportingCasesFromImportFolder,
  FilesForCaseFolderUploaded,
} from '@app/store/actions/babylon.actions';
import { AddToastNotification } from '@app/store/actions/notifications.actions';
import { ToastNotification } from '@app/models/toast-notification.model';
import { FilesImportService } from './files-import.service';
import { take } from 'rxjs/operators';

const IMPORT_FOLDER_NOT_FOUND_ERROR_MESSAGE = 'A requested file or directory could not be found at the time an operation was processed.';

@Injectable({
  providedIn: 'root',
})
export class DentalCasesImportService {
  constructor(
    private store: Store,
    private caseLoadersManagerService: CaseLoadersManagerService,
    private filesImportService: FilesImportService
  ) {}

  public importDentalCases() {
    this.store.pipe(select(fromSelectors.getProfilePreferences), take(1)).subscribe((preferences: any) => {
      if (preferences.importFolder) {
        this.filesImportService.verifyReadWritePermissions(preferences.importFolder).then((permissionGranted) => {
          if (permissionGranted) {
            this.filesImportService
              .getRawFolderContent(preferences.importFolder)
              .then((rawDentalCaseFolders) => {
                this.parseDentalCases(rawDentalCaseFolders).then((dentalCaseFolders) => {
                  this.store.dispatch(new CasesImportedFromImportFolder({ dentalCaseFolders }));
                });
              })
              .catch((error) => {
                if (error.message === IMPORT_FOLDER_NOT_FOUND_ERROR_MESSAGE) {
                  this.handleImportingDentalCasesError('importFolder.errors.folderNotFound');
                } else {
                  this.handleImportingDentalCasesError('importFolder.errors.unknownError');
                }
              });
          } else {
            this.handleImportingDentalCasesError('importFolder.errors.permissionNotGranted');
          }
        });
      } else {
        this.handleImportingDentalCasesError('importFolder.errors.defaultFolderNotSet');
      }
    });
  }

  public importDentalCaseFromFolderHandle(folderHandle: FileSystemDirectoryHandle) {
    this.filesImportService.verifyReadWritePermissions(folderHandle).then((permissionGranted) => {
      if (permissionGranted) {
        this.filesImportService
          .getRawFolderContent(folderHandle, false)
          .then((rawDentalCaseFolders) => {
            const folderName = rawDentalCaseFolders[0] ? rawDentalCaseFolders[0].folderName : '';
            const files = rawDentalCaseFolders[0] ? rawDentalCaseFolders[0].files : [];
            this.store.dispatch(new FilesForCaseFolderUploaded({ folderName, files, folderHandle }));
          })
          .catch(() => {
            this.handleError('importFolder.errors.unknownError');
          });
      } else {
        this.handleError('importFolder.errors.permissionNotGranted');
      }
    });
  }

  private handleImportingDentalCasesError(messageTranslationKey) {
    this.handleError(messageTranslationKey);
    this.store.dispatch(new ErrorImportingCasesFromImportFolder());
  }

  private handleError(messageTranslationKey) {
    const toastNotification = ToastNotification.builder().withMessageTranslationKey(messageTranslationKey).build();
    this.store.dispatch(new AddToastNotification({ toastNotification }));
  }

  private async parseDentalCases(dentalCases: any) {
    const dentalCaseFolders = [];
    for await (const dentalCase of dentalCases) {
      if (dentalCase.childDirectoriesNumber === 0) {
        const dentalCaseFolder = await this.caseLoadersManagerService.discoverCameraVendorAndLoadCaseFolder(
          dentalCase.files,
          dentalCase.folderName,
          dentalCase.folderHandle
        );
        if (dentalCaseFolder) {
          dentalCaseFolders.push(dentalCaseFolder);
        }
      }
    }
    return dentalCaseFolders;
  }
}
