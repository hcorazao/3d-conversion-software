import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ErrorLoadingCaseFolder, PrepareAndLoadCase, LoadCase } from '@app/store/actions/babylon.actions';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { MeditCaseLoader } from './vendors/medit/medit-case-loader';
import { CaseLoader } from './case-loader';
import { TranslateService } from '@ngx-translate/core';
import { FileType } from '@app/models/enums/file-type.enum';
import { DentalCase } from '@app/models/dental-case.model';
import { ToastNotification } from '@app/models/toast-notification.model';
import { AddToastNotification } from '@app/store/actions/notifications.actions';
import { Vector3 } from '@babylonjs/core';

@Injectable({
  providedIn: 'root',
})
export class CaseLoadersManagerService {
  loaders: CaseLoader[] = [];

  constructor(private store: Store, private translate: TranslateService, private meditCaseLoader: MeditCaseLoader) {
    this.loaders = [meditCaseLoader];
  }

  async discoverCameraVendorLoadCaseFolderAndUploadToBabylon(
    files: File[],
    folderName: string,
    folderHandle: FileSystemDirectoryHandle = null
  ) {
    const dentalCaseFolder = await this.discoverCameraVendorAndLoadCaseFolder(files, folderName, folderHandle);
    if (dentalCaseFolder.errorMessage) {
      const toastNotification = ToastNotification.builder().withMessageTranslationKey(dentalCaseFolder.errorMessage).build();
      this.store.dispatch(new AddToastNotification({ toastNotification }));
      this.store.dispatch(
        new ErrorLoadingCaseFolder({
          dentalCaseFolder,
          fromImportFolder: false,
        })
      );
    } else {
      this.prepareAndLoadCaseFolder(dentalCaseFolder);
    }
  }
  async discoverCameraVendorAndLoadCaseFolder(files: File[], folderName: string, folderHandle: FileSystemDirectoryHandle = null) {
    for (const loader of this.loaders) {
      try {
        const caseFile = loader.findCaseFile(files);
        const patientDentalCase = await loader.parseCaseFile(caseFile);
        const dentalCaseFolder = await loader.prepareFullCaseFolder(patientDentalCase, caseFile, files);
        const dentalCaseFolderValidated = this.validateDentalCaseFolder(dentalCaseFolder, folderName);
        dentalCaseFolderValidated.folderHandle = folderHandle;
        return dentalCaseFolderValidated;
      } catch (error) {
        return this.validateDentalCaseFolder(null, folderName);
      }
    }
  }

  private validateDentalCaseFolder(dentalCaseFolder: DentalCaseFolder, folderName: string): DentalCaseFolder {
    let validatedDentalCaseFolder = dentalCaseFolder;
    if (!dentalCaseFolder) {
      validatedDentalCaseFolder = this.updateErroneousDentalCaseFolder(
        dentalCaseFolder,
        folderName,
        'caseFolderDropzone.errors.noCameraVendorMatch'
      );
    } else if (
      (dentalCaseFolder.fileType !== FileType.OBJ &&
        dentalCaseFolder.fileType !== FileType.PLY &&
        dentalCaseFolder.fileType !== FileType.STL) ||
      (!dentalCaseFolder.files.lowerJawSitu &&
        !dentalCaseFolder.files.upperJawSitu &&
        !dentalCaseFolder.files.lowerJaw &&
        !dentalCaseFolder.files.upperJaw)
    ) {
      validatedDentalCaseFolder = this.updateErroneousDentalCaseFolder(
        dentalCaseFolder,
        folderName,
        'caseFolderDropzone.errors.noObjFileType'
      );
    } else if (!dentalCaseFolder.files.lowerJawSitu && !dentalCaseFolder.files.upperJawSitu) {
      validatedDentalCaseFolder = this.updateErroneousDentalCaseFolder(
        dentalCaseFolder,
        folderName,
        'caseFolderDropzone.errors.noSituScanAvailable'
      );
    }
    return validatedDentalCaseFolder;
  }

  private updateErroneousDentalCaseFolder(
    loadedDentalCaseFolder: DentalCaseFolder,
    folderName: string,
    errorMessageTranslationKey: string
  ): DentalCaseFolder {
    const dentalCaseFolder = !!loadedDentalCaseFolder ? loadedDentalCaseFolder : new DentalCaseFolder();
    if (!dentalCaseFolder.dentalCase) {
      dentalCaseFolder.dentalCase = new DentalCase();
    }
    if (!dentalCaseFolder.dentalCase.name) {
      dentalCaseFolder.dentalCase.name = folderName;
    }
    dentalCaseFolder.errorMessage = this.translate.instant(errorMessageTranslationKey);
    return dentalCaseFolder;
  }

  private prepareAndLoadCaseFolder(dentalCaseFolder: DentalCaseFolder) {
    this.store.dispatch(
      new PrepareAndLoadCase({
        dentalCaseFolder,
        fromImportFolder: false,
      })
    );
  }

  public async parseVectorFilesAndLoadCaseFolder(dentalCaseFolder: DentalCaseFolder, fromImportFolder: boolean) {
    const updatedDentalCaseFolder = Object.assign(new DentalCaseFolder(), dentalCaseFolder);
    updatedDentalCaseFolder.vectorsArrays = {
      marginVectorsArray: await this.parseDentalCaseVectorFile(dentalCaseFolder.files.marginFile),
      copylineVectorsArray: await this.parseDentalCaseVectorFile(dentalCaseFolder.files.copylineFile),
    };

    this.store.dispatch(
      new LoadCase({
        dentalCaseFolder: updatedDentalCaseFolder,
        fromImportFolder,
      })
    );
  }

  private async parseDentalCaseVectorFile(file: File): Promise<Vector3[]> {
    if (file) {
      const text = await file.text();
      const array = [];
      const lines = text.split('\n');
      const num = parseInt(lines[0], 0);
      for (let i = 1; i <= num; i++) {
        const c = lines[i].split(' ');
        const pos = new Vector3(parseFloat(c[0]), parseFloat(c[1]), parseFloat(c[2]));
        array.push(pos);
      }
      return array;
    } else {
      return null;
    }
  }
}
