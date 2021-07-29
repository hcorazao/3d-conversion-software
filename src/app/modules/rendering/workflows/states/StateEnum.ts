export enum StateEnum {
  TrueState = 'TrueState',

  // 1 Import
  AppStarted = 'AppStarted',
  PreparationImported = 'PreparationImported',

  // 2 Preparation Margin
  EnterPreparationMargin = 'EnterPreparationMargin',
  PreparationMarginEntered = 'PreparationMarginEntered',

  // 3 Insertion Axis
  CreateInsertionAxis = 'CreateInsertionAxis',
  InsertionAxisCreated = 'InsertionAxisCreated',

  // 4 Copy Line
  CreateCopyLine = 'CreateCopyLine',
  CopyLineCreated = 'CopyLineCreated',

  // 5 Copy Restoration
  CreateCopyRestoration = 'CreateCopyRestoration',
  CopyRestorationCreated = 'CopyRestorationCreated',

  // 6 Export Restoration
  ExportRestoration = 'ExportRestoration',
}
