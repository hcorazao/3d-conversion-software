import AbstractLoader from './AbstractLoader';
import ProjectObjects from './../ProjectManagement/ProjectObjects';
import ViewAPI from '../../ViewApi';
import SceneObjectsManager from '../SceneObjectsManager';
import DistanceCalculator from '../Tools/DistanceCalculator';
import InsertionAxisEffect from '../Tools/InsertionAxisEffect';
/**
 * MeditLoader is able to load a Medit project
 * it keeps track of the 3d objects that are being in the scene and the user information
 *
 */

export default class MeditLoader extends AbstractLoader {
  constructor() {
    super();
  }

  loadFromFiles(listOf3DModels, listOfXML, projectObjects: ProjectObjects): void {
    listOf3DModels.forEach((file) => {
      if (file.name.includes('-upperjaw.') && !file.name.includes('situ')) {
        this.loadMeshFromFile(file, (arrayOfMeshes) => {
          projectObjects.setUpper(arrayOfMeshes[0]);
          arrayOfMeshes[0].mustDepthSortFacets = true;

          SceneObjectsManager.GetInstance().setJawVisibilityExclusively(SceneObjectsManager.GetInstance().isPreparation);
          SceneObjectsManager.GetInstance().setJawPickedExclusively(SceneObjectsManager.GetInstance().isPreparation);

          if (SceneObjectsManager.GetInstance().isPreparation === SceneObjectsManager.JawType.UpperJaw) {
            setTimeout(() => {
              ViewAPI.getInstance().API.notifyCaseInitiallyLoaded();
            }, 100);
          }
        });
      }

      if (file.name.includes('-lowerjaw.') && !file.name.includes('situ')) {
        this.loadMeshFromFile(file, (arrayOfMeshes) => {
          projectObjects.setLower(arrayOfMeshes[0]);
          arrayOfMeshes[0].mustDepthSortFacets = true;

          SceneObjectsManager.GetInstance().setJawVisibilityExclusively(SceneObjectsManager.GetInstance().isPreparation);
          SceneObjectsManager.GetInstance().setJawPickedExclusively(SceneObjectsManager.GetInstance().isPreparation);

          if (SceneObjectsManager.GetInstance().isPreparation === SceneObjectsManager.JawType.LowerJaw) {
            setTimeout(() => {
              ViewAPI.getInstance().API.notifyCaseInitiallyLoaded();
            }, 100);
          }
        });
      }

      if (file.name.includes('-upperjaw-situ.')) {
        this.loadMeshFromFile(file, (arrayOfMeshes) => {
          projectObjects.setOcclusion(arrayOfMeshes[0]);
          arrayOfMeshes[0].mustDepthSortFacets = true;

          SceneObjectsManager.GetInstance().setJawVisibilityExclusively(SceneObjectsManager.GetInstance().isPreparation);
          SceneObjectsManager.GetInstance().setJawPickedExclusively(SceneObjectsManager.GetInstance().isPreparation);
        });
      }

      if (file.name.includes('-lowerjaw-situ.')) {
        this.loadMeshFromFile(file, (arrayOfMeshes) => {
          projectObjects.setOcclusion(arrayOfMeshes[0]);
          arrayOfMeshes[0].mustDepthSortFacets = true;

          SceneObjectsManager.GetInstance().setJawVisibilityExclusively(SceneObjectsManager.GetInstance().isPreparation);
          SceneObjectsManager.GetInstance().setJawPickedExclusively(SceneObjectsManager.GetInstance().isPreparation);
        });
      }
    });
  }
}
