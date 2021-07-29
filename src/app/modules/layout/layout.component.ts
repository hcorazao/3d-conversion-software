import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { trigger, state, style, transition, animate, group } from '@angular/animations';

import * as fromSelectors from '@app/store/selectors';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { FolderHandleForCaseFolderUploaded, BabylonActionType } from '@app/store/actions/babylon.actions';
import { AllToolboxesSettings } from '@app/models/all-toolboxes-settings.model';
import { ToolboxesSettingsUpdateHelperService } from './services/toolboxes-settings-update-helper.service';
import { PanelsPositionerService } from './services/utils/panels-positioner/panels-positioner.service';
import { ToolboxElementAndSettings, ToolboxesWithSettings } from '@app/models/toolbox-with-settings.model';
import { Offset } from '@app/models/offset.model';
import { ToastNotification } from '@app/models/toast-notification.model';
import { ActionNotification } from '@app/models/action-notification.model';
import { DentalCaseSimple } from '@app/models/dental-case-simple.model';
import { AddToastNotificationByType } from '@app/store/actions/notifications.actions';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { DialogManagerService } from './services/dialog-manager.service';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('displayed', style({ opacity: '1', display: 'flex' })),
      state('hidden', style({ opacity: '0', display: 'none' })),

      transition('hidden => displayed', [style({ display: 'flex' }), group([animate('0.8s 0.1s', style({ opacity: '1' }))])]),
      transition('displayed => hidden', [group([animate(300, style({ opacity: '0' })), style({ display: 'none' })])]),
    ]),
  ],
})
export class LayoutComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('main', { static: true }) mainElement: ElementRef<HTMLElement>;
  @ViewChild('devToolbox') devToolboxElement: ElementRef<HTMLElement>;
  @ViewChild('toolsToolbox') toolsToolboxElement: ElementRef<HTMLElement>;
  @ViewChild('caseObjectsToolbox') caseObjectsToolboxElement: ElementRef<HTMLElement>;
  @ViewChild('cadAssistantToolbox') cadAssistantToolboxElement: ElementRef<HTMLElement>;

  private destroy$ = new Subject();
  caseFolderImportComponentVisible$: Observable<boolean>;
  initialCaseLoading$: Observable<boolean>;
  objectsToolboxVisible$: Observable<boolean>;
  toolsToolboxVisible$: Observable<boolean>;
  sidebarOpen$: Observable<boolean>;
  dentalCaseFolder$: Observable<DentalCaseFolder>;
  toastNotifications$: Observable<ToastNotification[]>;
  actionNotifications$: Observable<ActionNotification[]>;
  uploadNotificationDisplayed$: Observable<boolean>;
  freshDentalCasesForNotification$: Observable<DentalCaseSimple[]>;
  actionNotificationsVisible$: Observable<boolean>;
  freshCasesNotificationVisible$: Observable<boolean>;
  panelsVisible$: Observable<boolean>;

  devPanelFocused = false;
  toolsPanelFocused = false;
  caseObjectsPanelFocused = false;
  cadAssistantPanelFocused = false;

  allToolboxesSettings: AllToolboxesSettings;
  dentalCaseFolder: DentalCaseFolder;
  devToolsUsagePermission$: Observable<boolean>;
  draggingFolder = false;
  droppedFolder = false;

  constructor(
    private store: Store,
    private toolboxesSettingsHelper: ToolboxesSettingsUpdateHelperService,
    private panelsPositioner: PanelsPositionerService,
    private dialogManager: DialogManagerService,
    private actions: Actions
  ) {}

  ngOnInit(): void {
    this.caseFolderImportComponentVisible$ = this.store.pipe(
      select(fromSelectors.isCaseFolderImportComponentVisible),
      takeUntil(this.destroy$)
    );
    this.initialCaseLoading$ = this.store.pipe(select(fromSelectors.isInitialCaseLoading), takeUntil(this.destroy$));
    this.objectsToolboxVisible$ = this.store.pipe(select(fromSelectors.isObjectsToolboxVisible), takeUntil(this.destroy$));
    this.toolsToolboxVisible$ = this.store.pipe(select(fromSelectors.isToolsToolboxVisible), takeUntil(this.destroy$));
    this.dentalCaseFolder$ = this.store.pipe(select(fromSelectors.getDentalCaseFolder), takeUntil(this.destroy$));
    this.dentalCaseFolder$.subscribe((dentalCaseFolder) => {
      this.dentalCaseFolder = dentalCaseFolder;
    });
    this.devToolsUsagePermission$ = this.store.pipe(select(fromSelectors.getDevToolsUsagePermission), takeUntil(this.destroy$));
    this.sidebarOpen$ = this.store.pipe(select(fromSelectors.isSidebarOpen), takeUntil(this.destroy$));
    const allToolboxesSettings$ = this.store.pipe(select(fromSelectors.getAllToolboxesSettings), takeUntil(this.destroy$));
    allToolboxesSettings$.subscribe((allToolboxesSettings) => {
      this.allToolboxesSettings = allToolboxesSettings;
    });
    this.toastNotifications$ = this.store.pipe(select(fromSelectors.getToastNotifications), takeUntil(this.destroy$));
    this.actionNotifications$ = this.store.pipe(select(fromSelectors.getActionNotifications), takeUntil(this.destroy$));
    this.uploadNotificationDisplayed$ = this.store.pipe(select(fromSelectors.isUploadNotificationDisplayed), takeUntil(this.destroy$));
    this.freshDentalCasesForNotification$ = this.store.pipe(
      select(fromSelectors.getFreshDentalCasesForNotification),
      takeUntil(this.destroy$)
    );
    this.actionNotificationsVisible$ = this.store.pipe(select(fromSelectors.isActionNotificationsVisible), takeUntil(this.destroy$));
    this.freshCasesNotificationVisible$ = this.store.pipe(select(fromSelectors.isFreshCasesNotificationVisible), takeUntil(this.destroy$));
    this.panelsVisible$ = this.store.pipe(select(fromSelectors.arePanelsVisible), takeUntil(this.destroy$));
    this.actions.pipe(ofType(BabylonActionType.stoppedLoadingCase), takeUntil(this.destroy$)).subscribe(() => {
      this.droppedFolder = false;
    });

    window.addEventListener('dragenter', () => {
      this.draggingFolder = true;
    });
  }

  ngAfterViewInit(): void {
    this.positionToolboxes();
  }

  ngAfterViewChecked(): void {
    this.positionToolboxes();
  }

  private positionToolboxes() {
    const allToolboxesWithSettings = this.getAllToolboxElementAndSettings();
    this.panelsPositioner.positionPanels(allToolboxesWithSettings, this.mainElement);
  }

  private getAllToolboxElementAndSettings(): ToolboxesWithSettings {
    return ToolboxesWithSettings.builder()
      .withDevToolbox(new ToolboxElementAndSettings(this.devToolboxElement?.nativeElement, this.allToolboxesSettings.devToolboxSettings))
      .withToolsToolbox(
        new ToolboxElementAndSettings(this.toolsToolboxElement?.nativeElement, this.allToolboxesSettings.toolsToolboxSettings)
      )
      .withCaseObjectsToolbox(
        new ToolboxElementAndSettings(this.caseObjectsToolboxElement?.nativeElement, this.allToolboxesSettings.caseObjectsToolboxSettings)
      )
      .withCadAssistantToolbox(
        new ToolboxElementAndSettings(this.cadAssistantToolboxElement?.nativeElement, this.allToolboxesSettings.cadAssistantToolboxSettings)
      )
      .build();
  }

  public onFileOrCatalogLeave() {
    this.draggingFolder = false;
  }

  public allowDrop(event) {
    event.preventDefault();
  }
  public onFileOrCatalogDropped(event) {
    this.draggingFolder = false;
    this.droppedFolder = true;
    setTimeout(() => {
      this.droppedFolder = false;
    }, 1000);
    event.preventDefault();
    const eventItems = event.dataTransfer.items;
    for (const item of eventItems) {
      if (item.kind === 'file') {
        item.getAsFileSystemHandle().then((folderHandle) => {
          if (folderHandle.kind === 'directory') {
            if (this.dentalCaseFolder) {
              this.dialogManager.openConfirmationDialog('sidebar.loadCaseFromImportFolderModal', () =>
                this.store.dispatch(new FolderHandleForCaseFolderUploaded({ folderHandle }))
              );
            } else {
              this.store.dispatch(new FolderHandleForCaseFolderUploaded({ folderHandle }));
            }
          } else {
            this.store.dispatch(new AddToastNotificationByType({ type: ToastNotificationType.IMPORTING_FILE_INSTEAD_OF_FOLDER_ERROR }));
          }
        });
      }
    }
  }

  toggleMinimizationObjectsToolbox() {
    this.toolboxesSettingsHelper.toggleMinimizationObjectsToolbox(!this.allToolboxesSettings.caseObjectsToolboxSettings.minimized);
  }

  toggleMinimizationDevToolbox() {
    this.toolboxesSettingsHelper.toggleMinimizationDevToolbox(!this.allToolboxesSettings.devToolboxSettings.minimized);
  }

  toggleMinimizationToolsToolbox() {
    this.toolboxesSettingsHelper.toggleMinimizationToolsToolbox(!this.allToolboxesSettings.toolsToolboxSettings.minimized);
  }

  toggleMinimizationCaseProgressStepper() {
    this.toolboxesSettingsHelper.toggleMinimizationCaseProgressStepper(!this.allToolboxesSettings.cadAssistantToolboxSettings.minimized);
  }

  toggleCadAssistantTipsEnabled() {
    this.toolboxesSettingsHelper.toggleCadAssistantTipsEnabled(!this.allToolboxesSettings.cadAssistantToolboxSettings.tipsEnabled);
  }

  saveNewDevToolboxPosition(dragOffset: Offset) {
    this.toolboxesSettingsHelper.saveNewDevToolboxPosition(this.mainElement, this.devToolboxElement, dragOffset);
  }

  saveNewToolsToolboxPosition(dragOffset: Offset) {
    this.toolboxesSettingsHelper.saveNewToolsToolboxPosition(this.mainElement, this.toolsToolboxElement, dragOffset);
  }

  saveNewCaseObjectsToolboxPosition(dragOffset: Offset) {
    this.toolboxesSettingsHelper.saveNewCaseObjectsToolboxPosition(this.mainElement, this.caseObjectsToolboxElement, dragOffset);
  }

  saveNewCadAssistantToolboxPosition(dragOffset: Offset) {
    this.toolboxesSettingsHelper.saveNewCadAssistantToolboxPosition(this.mainElement, this.cadAssistantToolboxElement, dragOffset);
  }

  toggleSidebar() {
    this.toolboxesSettingsHelper.toggleSidebar();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
