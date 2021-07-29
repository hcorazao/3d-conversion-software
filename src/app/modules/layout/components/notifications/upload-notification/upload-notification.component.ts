import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { trigger, state, style, transition, animate, group } from '@angular/animations';

import * as fromSelectors from '@app/store/selectors';
import { DismissUploadNotification, ToggleUploadNotificationMinimization } from '@app/store/actions/notifications.actions';
import { CaseFileUpload } from '@app/models/case-file-upload.model';
import { CaseFileUploadStatus } from '@app/models/enums/case-file-upload-status.enum';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-upload-notification',
  templateUrl: './upload-notification.component.html',
  styleUrls: ['./upload-notification.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('expanded', style({ height: '*', opacity: '1' })),
      state('collapsed', style({ height: 0, opacity: '0' })),

      transition('collapsed => expanded', [group([animate(200, style({ height: '*' })), animate(300, style({ opacity: '1' }))])]),
      transition('expanded => collapsed', [group([animate('0.2s 0.2s', style({ opacity: '0' })), animate(300, style({ height: 0 }))])]),
    ]),
  ],
})
export class UploadNotificationComponent implements OnInit, OnDestroy {
  CaseFileUploadStatus = CaseFileUploadStatus;

  private destroy$ = new Subject();
  minimized$: Observable<boolean>;
  caseFileUploads$: Observable<CaseFileUpload[]>;

  autoClosing = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.minimized$ = this.store.pipe(select(fromSelectors.isUploadNotificationMinimized), takeUntil(this.destroy$));
    this.caseFileUploads$ = this.store.pipe(select(fromSelectors.getCaseFileUploads), takeUntil(this.destroy$));
    this.caseFileUploads$.subscribe((caseFileUploads) => {
      if (
        caseFileUploads.length > 0 &&
        caseFileUploads.filter((upload) => upload.status !== CaseFileUploadStatus.FINISHED_WITH_SUCCESS).length === 0
      ) {
        this.autoClosing = true;
      }
    });
  }

  closeNotification() {
    this.store.dispatch(new DismissUploadNotification());
  }

  toggleMinimization() {
    this.store.dispatch(new ToggleUploadNotificationMinimization());
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
