import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store, select } from '@ngrx/store';
import {
  UpdateImportFolderPreference,
  UpdateExportFolderPreference,
  UpdateLanguagePreference,
  UpdateDentalNotationPreference,
} from '@app/store/actions/settings.actions';
import { Observable, Subject, throwError } from 'rxjs';
import * as fromSelectors from '@app/store/selectors';
import { ProfilePreferences } from '@app/models/profile-preferences.model';
import { Language } from '@app/models/enums/language.enum';
import { AddToastNotificationByType } from '@app/store/actions/notifications.actions';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { takeUntil } from 'rxjs/operators';
import { FilesImportService } from '@app/shared/services/files-import.service';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss'],
})
export class UserPreferencesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  param = { value: 'world' };
  profilePreferences$: Observable<ProfilePreferences>;
  Language = Language;

  constructor(private store: Store, public translate: TranslateService, private filesImportService:FilesImportService) {}

  ngOnInit(): void {
    this.profilePreferences$ = this.store.pipe(select(fromSelectors.getProfilePreferences), takeUntil(this.destroy$));
  }

  languageSelected(language) {
    this.store.dispatch(
      new UpdateLanguagePreference({
        language,
      })
    );
  }

  chooseImportFolderLocation() {
    if ('showDirectoryPicker' in window) {
      (window as any)
        .showDirectoryPicker()
        .then((folderHandle) => {
          this.filesImportService.verifyReadWritePermissions(folderHandle).then((permissionGranted) => {
            if (permissionGranted) {
              this.store.dispatch(
                new UpdateImportFolderPreference({
                  importFolder: folderHandle,
                })
              );
            } else {
              this.store.dispatch(new AddToastNotificationByType({ type: ToastNotificationType.PERMISSION_TO_FOLDER_NOT_GRANTED_ERROR }));
            }
          });          
        })
        .catch(() => {
          this.store.dispatch(new AddToastNotificationByType({ type: ToastNotificationType.PERMISSION_TO_FOLDER_NOT_GRANTED_ERROR }));
        });
    }
  }

  chooseExportFolderLocation() {
    if ('showDirectoryPicker' in window) {
      (window as any)
        .showDirectoryPicker()
        .then((folderHandle) => {
          this.store.dispatch(
            new UpdateExportFolderPreference({
              exportFolder: folderHandle,
            })
          );
        })
        .catch(() => {
          this.store.dispatch(new AddToastNotificationByType({ type: ToastNotificationType.PERMISSION_TO_FOLDER_NOT_GRANTED_ERROR }));
        });
    }
  }

  dentalNotationSelected(dentalNotation) {
    this.store.dispatch(new UpdateDentalNotationPreference({ dentalNotation }));
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
