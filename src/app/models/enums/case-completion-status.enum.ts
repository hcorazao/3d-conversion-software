export enum CaseCompletionStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}

export const getTranslationKeyForCaseCompletionStatus = (caseCompletionStatus: CaseCompletionStatus): string => {
  switch (caseCompletionStatus) {
    case CaseCompletionStatus.NOT_STARTED:
      return 'shared.caseCompletionStatus.notStarted';
    case CaseCompletionStatus.IN_PROGRESS:
      return 'shared.caseCompletionStatus.inProgress';
    case CaseCompletionStatus.COMPLETED:
      return 'shared.caseCompletionStatus.completed';
  }
};
