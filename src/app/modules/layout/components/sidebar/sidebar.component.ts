import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import {
  ImportCasesFromImportFolder,
  PrepareAndLoadCase,
  LoadRecentDentalCases,
  BabylonActionType,
} from '@app/store/actions/babylon.actions';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { first, takeUntil } from 'rxjs/operators';
import { RecentDentalCase } from '@app/models/recent-dental-case.model';
import { DentalCaseSimple } from '@app/models/dental-case-simple.model';
import { TimeUtilsService } from '@app/shared/utils/time-utils.service';
import { ButtonType } from '../button/button.component';
import { AddToastNotificationByType } from '@app/store/actions/notifications.actions';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { DialogManagerService } from '@app/modules/layout/services/dialog-manager.service';
import { PatientWithCases } from '@app/models/patient-with-cases.model';
import { Patient } from '@app/models/patient.model';
import { Actions, ofType } from '@ngrx/effects';
import { OpenSidebar } from '@app/store/actions/settings.actions';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  ButtonType = ButtonType;

  private destroy$ = new Subject();

  areCasesAvailableToImportFromImportFolder$: Observable<boolean>;
  isImportingCasesFromImportFolder$: Observable<boolean>;
  importedDentalCaseFolders$: Observable<DentalCaseFolder[]>;
  dentalCaseFolder$: Observable<DentalCaseFolder>;

  suggestedImportsExpanded = false;
  recentCasesExpanded = false;
  allCasesExpanded = false;

  allPatientsWithCases$ = new BehaviorSubject([]);
  recentPatientsWithCases$ = new BehaviorSubject([]);
  searchedPatients: PatientWithCases[] = [];
  recentDentalCases$ = new BehaviorSubject<RecentDentalCase[]>([]);

  recentCases = [];
  importedCases = false;
  searchText = '';

  constructor(
    private store: Store,
    private actions$: Actions,
    private timeUtils: TimeUtilsService,
    private dialogManager: DialogManagerService
  ) {}

  ngOnInit(): void {
    this.subscribeToCases();
    this.subscribeToSearchPatientCase();
  }

  subscribeToCases() {
    this.areCasesAvailableToImportFromImportFolder$ = this.store.pipe(
      select(fromSelectors.areCasesAvailableToImportFromImportFolder),
      takeUntil(this.destroy$)
    );
    this.isImportingCasesFromImportFolder$ = this.store.pipe(
      select(fromSelectors.isImportingCasesFromImportFolder),
      takeUntil(this.destroy$)
    );
    this.dentalCaseFolder$ = this.store.pipe(select(fromSelectors.getDentalCaseFolder), takeUntil(this.destroy$));
    this.subscribeToImportedDentalCaseFolders();
    this.subscribeToRecentDentalCaseFolders();
    this.combineDentalCasesSubscriptionsToGetLatestPatientsWithCases();
  }

  subscribeToSearchPatientCase() {
    this.actions$.pipe(ofType(BabylonActionType.searchPatientDentalCases), takeUntil(this.destroy$)).subscribe((action: any) => {
      const patient = action.payload.patient;
      this.store.dispatch(new OpenSidebar());
      this.searchText = `${patient?.name ? patient.name : ''} ${patient?.id ? patient.id : ''}`.trim();
      this.searchPatients();
      this.importCasesIfAvailable();
    });
  }

  subscribeToImportedDentalCaseFolders() {
    this.importedDentalCaseFolders$ = this.store.pipe(select(fromSelectors.getImportedDentalCaseFolders), takeUntil(this.destroy$));
    this.importedDentalCaseFolders$.subscribe((importedDentalCaseFolders) => {
      const patientIdsToPatientsWithCases = new Map<string, PatientWithCases>();
      importedDentalCaseFolders
        .filter(
          (dentalCaseFolder: DentalCaseFolder) =>
            dentalCaseFolder.patient &&
            dentalCaseFolder.patient.id &&
            dentalCaseFolder.patient.name &&
            dentalCaseFolder.dentalCase &&
            dentalCaseFolder.dentalCase.name
        )
        .forEach((dentalCaseFolder: DentalCaseFolder) => {
          this.updateMapWithDentalCaseFolder(patientIdsToPatientsWithCases, dentalCaseFolder);
        });
      const patientsWithCases = Array.from(patientIdsToPatientsWithCases.values());
      this.allPatientsWithCases$.next(patientsWithCases);
    });
  }

  subscribeToRecentDentalCaseFolders() {
    this.store.pipe(select(fromSelectors.getRecentDentalCases)).subscribe((recentDentalCases: RecentDentalCase[]) => {
      const recentPatientsIds = new Set<string>();
      const mostRecentDentalCases = [];
      for (let i = 0; i < recentDentalCases.length && recentPatientsIds.size < 3; i++) {
        const recentDentalCase = recentDentalCases[i];
        if (!recentDentalCase.patient) {
          continue;
        }
        recentPatientsIds.add(recentDentalCase.patient.id);
        mostRecentDentalCases.push(recentDentalCase);
      }
      this.recentDentalCases$.next(mostRecentDentalCases);
    });
  }

  combineDentalCasesSubscriptionsToGetLatestPatientsWithCases() {
    combineLatest([this.recentDentalCases$, this.importedDentalCaseFolders$]).subscribe(
      ([recentDentalCases, importedDentalCaseFolders]) => {
        const recentPatientsIds = recentDentalCases.map((recentDentalCase) => recentDentalCase.patient.id);
        const recentDentalCasesNotAvailableInImportFolder = recentDentalCases.filter(
          (recentDentalCase) => !recentDentalCase.availableInImportFolder
        );
        const patientIdsToPatientsWithCases = new Map<string, PatientWithCases>();

        importedDentalCaseFolders
          .filter((dentalCaseFolder) => dentalCaseFolder.patient && recentPatientsIds.indexOf(dentalCaseFolder.patient.id) !== -1)
          .forEach((dentalCaseFolder) => {
            this.updateMapWithDentalCaseFolder(patientIdsToPatientsWithCases, dentalCaseFolder);
          });
        recentDentalCasesNotAvailableInImportFolder.forEach((recentDentalCase) => {
          this.updateMapWithDentalCaseFolder(patientIdsToPatientsWithCases, recentDentalCase, false);
        });

        const patientsWithCases = Array.from(patientIdsToPatientsWithCases.values());
        this.recentPatientsWithCases$.next(patientsWithCases);
      }
    );
  }

  private updateMapWithDentalCaseFolder(
    map: Map<string, PatientWithCases>,
    dentalCase: DentalCaseFolder | RecentDentalCase,
    availableInImportFolder: boolean = true
  ) {
    const patientId = dentalCase.patient?.id || '';
    const patientName = dentalCase.patient?.name;
    const dentalCaseSimple = DentalCaseSimple.builder()
      .withPatientName(patientId)
      .withPatientId(patientName)
      .withCaseName(dentalCase.dentalCase?.name)
      .withCaseDate(dentalCase.dentalCase?.date)
      .withCaseFormattedDate(this.timeUtils.formatDate(dentalCase.dentalCase?.date))
      .withAvailableInImportFolder(availableInImportFolder)
      .withCompletionStatus(dentalCase.completionStatus)
      .withErrorMessage(dentalCase.errorMessage)
      .build();
    if (!map.has(patientId)) {
      const patientWithCases = PatientWithCases.builder()
        .withPatient(Patient.builder().withId(patientId).withName(patientName).build())
        .withCases([])
        .build();
      map.set(patientId, patientWithCases);
    }
    map.get(patientId).dentalCaseSimples.push(dentalCaseSimple);
  }

  compareImportedDentalCaseFolders(dentalCase1: DentalCaseSimple, dentalCase2: DentalCaseSimple) {
    if (dentalCase1.patientName === dentalCase2.patientName) {
      return dentalCase1.caseDate < dentalCase2.caseDate ? -1 : 1;
    } else {
      return dentalCase1.patientName < dentalCase2.patientName ? -1 : 1;
    }
  }

  initializeSearch() {
    this.importCasesIfAvailable();
  }

  toggleSuggestedImports() {
    this.suggestedImportsExpanded = !this.suggestedImportsExpanded;
    this.importCasesIfAvailable();
  }

  toggleRecentCases() {
    this.recentCasesExpanded = !this.recentCasesExpanded;
    this.importCasesIfAvailable();
  }

  toggleAllCases() {
    this.allCasesExpanded = !this.allCasesExpanded;
    this.importCasesIfAvailable();
  }

  importCasesIfAvailable() {
    if (this.importedCases) {
      return;
    }
    this.areCasesAvailableToImportFromImportFolder$.subscribe((available) => {
      if (available) {
        this.store.dispatch(new ImportCasesFromImportFolder());
        this.importedCases = true;
      }
    });
    this.store.dispatch(new LoadRecentDentalCases());
    this.searchPatients();
  }

  handleDentalCaseSelected(caseName: string) {
    this.dentalCaseFolder$.pipe(first()).subscribe((dentalCaseFolder) => {
      if (!dentalCaseFolder) {
        this.loadCaseFromImportFolder(caseName);
      } else {
        this.dialogManager.openConfirmationDialog('sidebar.loadCaseFromImportFolderModal', () => this.loadCaseFromImportFolder(caseName));
      }
    });
  }

  loadCaseFromImportFolder(caseName: string) {
    this.importedDentalCaseFolders$.pipe(first()).subscribe((importedDentalCaseFolders) => {
      const selectedCaseFolder = importedDentalCaseFolders.filter((dentalCaseFolder) => dentalCaseFolder.dentalCase.name === caseName)[0];
      if (selectedCaseFolder) {
        this.store.dispatch(new PrepareAndLoadCase({ dentalCaseFolder: selectedCaseFolder, fromImportFolder: true }));
      } else {
        this.store.dispatch(
          new AddToastNotificationByType({ type: ToastNotificationType.SELECTED_DENTAL_CASE_NOT_FOUND_IN_IMPORT_FOLDER_ERROR })
        );
      }
    });
  }

  filterSuggestedImports(allLoadedCases: DentalCaseSimple[], recentCasesNames: string[]): DentalCaseSimple[] {
    if (!allLoadedCases || !recentCasesNames) {
      return [];
    }
    return allLoadedCases
      .filter((dentalCaseSimple: DentalCaseSimple) => recentCasesNames.indexOf(dentalCaseSimple.caseName) === -1)
      .sort((a, b) => (a.caseFormattedDate > b.caseFormattedDate ? 1 : -1))
      .slice(0, 3);
  }

  searchPatients() {
    if (!this.searchText) {
      this.searchedPatients = [];
      return;
    }
    const searchParts = this.searchText.toLowerCase().split(' ');
    this.allPatientsWithCases$.subscribe((allForSearch) => {
      this.searchedPatients = allForSearch.filter(
        (patientWithCases) =>
          patientWithCases.patient &&
          patientWithCases.patient.name &&
          !searchParts.some(
            (searchPart) =>
              patientWithCases.patient.name.toLowerCase().indexOf(searchPart) === -1 &&
              patientWithCases.patient.id.toLowerCase().indexOf(searchPart) === -1
          )
      );
    });
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
