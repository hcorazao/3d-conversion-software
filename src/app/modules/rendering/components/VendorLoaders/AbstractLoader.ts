import { SceneLoader, StandardMaterial } from '@babylonjs/core';

import ProjectObjects from './../ProjectManagement/ProjectObjects';
import SceneManager from './../../core/SceneManager';
import SceneAppearance from '../Tools/SceneAppearance';

/**
 * MeditLoader is able to load a Medit project
 * it keeps track of the 3d objects that are being in the scene and the user information
 *
 */

export default abstract class AbstractLoader {
  protected projectInfo: object;
  protected projectObjects: ProjectObjects;

  constructor() {
    //
  }

  abstract loadFromFiles(listOf3DModels, listOfXML, callback): void;

  loadMeshFromFile(file: File, callback = (arrayOfMeshes) => {}) {
    SceneLoader.ImportMesh('', 'file:/', file, SceneManager.getInstance().current, (newMeshes) => {
      newMeshes.forEach((mesh) => {
        mesh.createNormals(true);

        const mat = SceneAppearance.createStandardMaterial('Mat_' + file.name);

        mesh.material = mat;
      });
      callback(newMeshes);
    });
  }
}
