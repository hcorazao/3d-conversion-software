import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { DevSettings } from '@app/models/dev-settings.model';
import { UpdateDevSettings, TogglePanelsRepositioning } from '@app/store/actions/settings.actions';
import {
  DisplayUploadNotification,
  SetFreshDentalCasesForNotification,
  AddToastNotificationByType,
  AddActionNotificationByType,
} from '@app/store/actions/notifications.actions';
import { DentalCaseSimple } from '@app/models/dental-case-simple.model';
import { CaseCompletionStatus } from '@app/models/enums/case-completion-status.enum';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { ActionNotificationType } from '@app/models/enums/action-notification-type.enum';
import { CaseFileUpload } from '@app/models/case-file-upload.model';
import { CaseFileUploadStatus } from '@app/models/enums/case-file-upload-status.enum';
import { BabylonDebugCall } from '@app/store/actions/babylon.actions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

const MESH_VISIBILITY_NAME = 'meshVisibility';
const DEV_UI_NAME = 'devUI';
const TOAST_NOTIFICATION_TYPES = [
  ToastNotificationType.CASE_IMPORTED_SUCCESSFULLY,
  ToastNotificationType.CASE_EXPORTED_TO_FOLDER_SUCCESSFULLY,
  ToastNotificationType.CASE_EXPORTED_TO_DRIVE_SUCCESSFULLY,
  ToastNotificationType.CASE_EXPORTED_TO_DISK_SUCCESSFULLY,
  ToastNotificationType.DESIGN_PARAMETERS_UPDATED_SUCCESSFULLY,
  ToastNotificationType.PROFILE_DETAILS_UPDATED_SUCCESSFULLY,
  ToastNotificationType.CASE_NAME_UDATED_SUCCESSFULLY,
  ToastNotificationType.CASE_DELETED_SUCCESSFULLY,
  ToastNotificationType.AVATAR_UPDATED_SUCCESSFULLY,
  ToastNotificationType.PASSWORD_UPDATED_SUCCESSFULLY,
  ToastNotificationType.EMAIL_UPDATED_SUCCESSFULLY,
];
const ACTION_NOTIFICATION_TYPES = [
  ActionNotificationType.INSTALL_APP,
  ActionNotificationType.SET_PARAMETERS,
  ActionNotificationType.SET_PREFERENCES,
  ActionNotificationType.COMPLETE_PROFILE,
];

@Component({
  selector: 'app-dev-toolbox',
  templateUrl: './dev-toolbox.component.html',
  styleUrls: ['./dev-toolbox.component.scss'],
})
export class DevToolboxComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  devSettings: DevSettings = null;
  panelsRepositioning$: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.pipe(select(fromSelectors.getDevSettings), takeUntil(this.destroy$)).subscribe((devSettings: DevSettings) => {
      this.devSettings = devSettings;
    });
    this.panelsRepositioning$ = this.store.pipe(select(fromSelectors.isPanelsRepositioningActive));
  }

  toggleMeshVisibility() {
    this.updateSettingsWithPatch({ [MESH_VISIBILITY_NAME]: !this.devSettings.meshVisibility });
  }

  toggleDevUI() {
    this.updateSettingsWithPatch({ [DEV_UI_NAME]: !this.devSettings.devUI });
  }

  updateSettingsWithPatch(devSettingsPatch: Partial<DevSettings>) {
    const updateDevSettings: DevSettings = {
      ...this.devSettings,
      ...devSettingsPatch,
    };
    this.store.dispatch(new UpdateDevSettings({ devSettings: updateDevSettings }));
  }

  createRandomToastNotification() {
    const type = TOAST_NOTIFICATION_TYPES[Math.floor(Math.random() * TOAST_NOTIFICATION_TYPES.length)];
    this.store.dispatch(new AddToastNotificationByType({ type }));
  }

  createRandomActionNotification() {
    const type = ACTION_NOTIFICATION_TYPES[Math.floor(Math.random() * ACTION_NOTIFICATION_TYPES.length)];
    this.store.dispatch(new AddActionNotificationByType({ type }));
  }

  displayUploadNotification() {
    const caseFileUploads = [
      new CaseFileUpload('Maxillary pre-op', 'eddg-lower-first-molar-with-preop-upperjaw.obj', CaseFileUploadStatus.FINISHED_WITH_SUCCESS),
      new CaseFileUpload(
        'Maxillary post-op',
        'eddg-lower-first-molar-with-preop-upperjaw-situ.obj',
        CaseFileUploadStatus.FINISHED_WITH_ERROR
      ),
      new CaseFileUpload('Buccal', 'eddg-lower-first-molar-with-preop-occlusionfirst.obj', CaseFileUploadStatus.IN_PROGRESS),
      new CaseFileUpload('Mandibular', 'eddg-lower-first-molar-with-preop-lowerjaw.obj', CaseFileUploadStatus.IN_PROGRESS),
      new CaseFileUpload('Case information', 'eddg-lower-first-molar-with-preop.dentalProject', CaseFileUploadStatus.IN_PROGRESS),
    ];
    this.store.dispatch(new DisplayUploadNotification({ caseFileUploads }));
  }

  createRecentCasesForBottomNotification() {
    const nowMillis = new Date().getTime();
    const freshDentalCases = [
      DentalCaseSimple.builder()
        .withCaseName('eddg-lower-first-molar-with-preop')
        .withCaseDate(new Date(nowMillis - 10 * 60 * 1000))
        .withCompletionStatus(CaseCompletionStatus.NOT_STARTED)
        .withThumbnailSrc('assets/images/example-case-thumbnail-1.png')
        .build(),
      DentalCaseSimple.builder()
        .withCaseName('upper-second-molar-with-antagonist')
        .withCaseDate(new Date(nowMillis - 34 * 60 * 1000))
        .withCompletionStatus(CaseCompletionStatus.NOT_STARTED)
        .withThumbnailSrc('assets/images/example-case-thumbnail-2.png')
        .build(),
      DentalCaseSimple.builder()
        .withCaseName('lower-third-fourth-molar')
        .withCaseDate(new Date(nowMillis - 120 * 60 * 1000))
        .withCompletionStatus(CaseCompletionStatus.NOT_STARTED)
        .withThumbnailSrc('assets/images/example-case-thumbnail-3.png')
        .build(),
    ];
    this.store.dispatch(new SetFreshDentalCasesForNotification({ freshDentalCases }));
  }

  togglePanelsRepositioning() {
    this.store.dispatch(new TogglePanelsRepositioning());
  }

  callBabylonForDebug() {
    this.store.dispatch(new BabylonDebugCall());
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
