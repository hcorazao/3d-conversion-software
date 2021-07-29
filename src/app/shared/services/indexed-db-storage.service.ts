import { Injectable } from '@angular/core';
import { get, set } from 'idb-keyval';

export const recentDentalCasesKey = 'recentDentalCases';
export const importFolderHandleIdbKey = 'IMPORT_FOLDER_HANDLE';
export const exportFolderHandleIdbKey = 'EXPORT_FOLDER_HANDLE';
export const languageIdbKey = 'LANGUAGE';
export const dentalNotationIdbKey = 'DENTAL_NOTATION';
export const machineIdIdbKey = 'MACHINE_ID';
export const toolsSettingsIdbKey = 'TOOLS_SETTINGS';
export const sidebarOpenIdbKey = 'SIDEBAR_OPEN';
export const allToolboxesSettingsIdbKey = 'ALL_TOOLBOXES_SETTINGS';
export const profileDetailsIdbKey = 'PROFILE_DETAILS';
export const designParametersIdbKey = 'DESIGN_PARAMETERS';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbStorageService {
  constructor() {}

  getByKey(key: string): any {
    if (typeof indexedDB === 'undefined') {
      console.error('indexedDB is not defined');
      return undefined;
    }
    return get(key);
  }

  setWithKeyAndValue(key: string, value: any) {
    if (typeof indexedDB === 'undefined') {
      console.error('indexedDB is not defined');
      return undefined;
    }
    set(key, value);
  }
}
