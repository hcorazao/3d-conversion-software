import { Injectable } from '@angular/core';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { RecentDentalCase } from '@app/models/recent-dental-case.model';
import { IndexedDbStorageService, recentDentalCasesKey } from './indexed-db-storage.service';
import { Store } from '@ngrx/store';
import { LoadedRecentDentalCases } from '@app/store/actions/babylon.actions';
import { CaseCompletionStatus } from '@app/models/enums/case-completion-status.enum';

@Injectable({
  providedIn: 'root',
})
export class RecentDentalCasesService {
  constructor(private indexedDbStorageService: IndexedDbStorageService, private store: Store) {}

  public addRecentDentalCase(dentalCaseFolder: DentalCaseFolder, availableInImportFolder: boolean) {
    const recentDentalCase = RecentDentalCase.builder()
      .withPatient(dentalCaseFolder.patient)
      .withDentalCase(dentalCaseFolder.dentalCase)
      .withAvailableInImportFolder(availableInImportFolder)
      .withOpeningDate(new Date())
      .withCaseCompletionStatus(CaseCompletionStatus.IN_PROGRESS)
      .withErrorMessage(dentalCaseFolder.errorMessage)
      .build();
    this.indexedDbStorageService.getByKey(recentDentalCasesKey).then((recentDentalCasesFromDb) => {
      const recentDentalCases = recentDentalCasesFromDb ? [...recentDentalCasesFromDb] : [];
      const recentDentalCasesFiltered = recentDentalCases.filter(
        (dentalCase) => dentalCase.dentalCase.name !== recentDentalCase.dentalCase.name
      );
      recentDentalCasesFiltered.push(recentDentalCase);
      this.indexedDbStorageService.setWithKeyAndValue(recentDentalCasesKey, recentDentalCasesFiltered);
      this.store.dispatch(new LoadedRecentDentalCases({ recentDentalCases: recentDentalCasesFiltered }));
    });
  }

  public loadRecentDentalCases() {
    this.indexedDbStorageService.getByKey(recentDentalCasesKey).then((recentDentalCases) => {
      this.store.dispatch(new LoadedRecentDentalCases({ recentDentalCases }));
    });
  }

  public completeRecentDentalCase(dentalCaseName: string) {
    this.indexedDbStorageService.getByKey(recentDentalCasesKey).then((recentDentalCases) => {
      const updatedRecentDentalCases = recentDentalCases.map((recentDentalCase) => {
        if (recentDentalCase.dentalCase.name === dentalCaseName) {
          return {
            ...recentDentalCase,
            completionStatus: CaseCompletionStatus.COMPLETED,
          };
        } else {
          return recentDentalCase;
        }
      });
      this.indexedDbStorageService.setWithKeyAndValue(recentDentalCasesKey, updatedRecentDentalCases);
      this.store.dispatch(new LoadedRecentDentalCases({ recentDentalCases: updatedRecentDentalCases }));
    });
  }
}
