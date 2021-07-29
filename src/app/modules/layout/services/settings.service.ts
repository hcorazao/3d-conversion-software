import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SettingsLoaded } from '@app/store/actions/settings.actions';
import { Language } from '@app/models/enums/language.enum';
import { TranslateService } from '@ngx-translate/core';
import {
  allToolboxesSettingsIdbKey,
  dentalNotationIdbKey,
  designParametersIdbKey,
  exportFolderHandleIdbKey,
  importFolderHandleIdbKey,
  IndexedDbStorageService,
  languageIdbKey,
  profileDetailsIdbKey,
  sidebarOpenIdbKey,
  toolsSettingsIdbKey,
} from '@app/shared/services/indexed-db-storage.service';
import { ToolsSettings } from '@app/models/tools-settings.model';
import { AllToolboxesSettings } from '@app/models/all-toolboxes-settings.model';
import { ProfileDetails } from '@app/models/profile-details.model';
import { DesignParameters } from '@app/models/design-parameters.model';
import { DentalNotation } from '@app/models/enums/jaw.enum';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private store: Store, private translate: TranslateService, private indexedDbStorageService: IndexedDbStorageService) {}

  loadSettings() {
    Promise.all([
      this.indexedDbStorageService.getByKey(importFolderHandleIdbKey),
      this.indexedDbStorageService.getByKey(exportFolderHandleIdbKey),
      this.indexedDbStorageService.getByKey(languageIdbKey),
      this.indexedDbStorageService.getByKey(dentalNotationIdbKey),
      this.indexedDbStorageService.getByKey(toolsSettingsIdbKey),
      this.indexedDbStorageService.getByKey(sidebarOpenIdbKey),
      this.indexedDbStorageService.getByKey(allToolboxesSettingsIdbKey),
      this.indexedDbStorageService.getByKey(profileDetailsIdbKey),
      this.indexedDbStorageService.getByKey(designParametersIdbKey),
    ]).then((results) => {
      const [
        importFolder,
        exportFolder,
        language,
        dentalNotation,
        toolsSettings,
        sidebarOpen,
        allToolboxesSettings,
        profileDetails,
        designParameters,
      ] = results;
      if (language) {
        this.translate.use(language as Language);
      }
      if (!allToolboxesSettings) {
        this.updateAllToolboxesSettings(AllToolboxesSettings.createWithDefaultValues());
      } else {
        allToolboxesSettings.panelsVisible = true; // set default value
      }
      this.store.dispatch(
        new SettingsLoaded({
          profileDetails: profileDetails || new ProfileDetails(),
          designParameters: designParameters || DesignParameters.createWithDefaultValues(),
          profilePreferences: {
            importFolder,
            exportFolder,
            language: language as Language,
            dentalNotation: dentalNotation || DentalNotation.ISO_3950,
          },
          toolsSettings: toolsSettings || ToolsSettings.getDefault(),
          sidebarOpen: sidebarOpen === undefined ? true : sidebarOpen,
          allToolboxesSettings: allToolboxesSettings || AllToolboxesSettings.createWithDefaultValues(),
        })
      );
    });
  }

  updateDesignParameters(designParameters: DesignParameters) {
    this.indexedDbStorageService.setWithKeyAndValue(designParametersIdbKey, designParameters);
  }

  updateImportFolderPreference(importFolderHandle: any) {
    this.indexedDbStorageService.setWithKeyAndValue(importFolderHandleIdbKey, importFolderHandle);
  }

  updateExportFolderPreference(exportFolderHandle: any) {
    this.indexedDbStorageService.setWithKeyAndValue(exportFolderHandleIdbKey, exportFolderHandle);
  }

  updateLanguagePreference(language: Language) {
    this.translate.use(language);
    this.indexedDbStorageService.setWithKeyAndValue(languageIdbKey, language);
  }

  updateDentalNotationPreference(dentalNotation: DentalNotation) {
    this.indexedDbStorageService.setWithKeyAndValue(dentalNotationIdbKey, dentalNotation);
  }

  updateToolsSettings(toolsSettings: ToolsSettings) {
    this.indexedDbStorageService.setWithKeyAndValue(toolsSettingsIdbKey, toolsSettings);
  }

  updateSidebarSettings(sidebarOpen: boolean) {
    this.indexedDbStorageService.setWithKeyAndValue(sidebarOpenIdbKey, sidebarOpen);
  }

  updateAllToolboxesSettings(allToolboxesSettings: AllToolboxesSettings) {
    this.indexedDbStorageService.setWithKeyAndValue(allToolboxesSettingsIdbKey, allToolboxesSettings);
  }

  updateProfileDetails(profileDetails: ProfileDetails) {
    this.indexedDbStorageService.setWithKeyAndValue(profileDetailsIdbKey, profileDetails);
  }
}
