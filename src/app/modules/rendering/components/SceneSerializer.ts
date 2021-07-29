import { AppFacadeApi } from '@app/facade/app-facade-api';
import { SceneSerializer } from '@babylonjs/core';
import { GLTF2Export } from '@babylonjs/serializers';
import SceneObjectsManager from './SceneObjectsManager';

export default class CRSceneSerializer {
  static ExportScene(objectManager: SceneObjectsManager, appFacadeApi: AppFacadeApi) {
    const glbFilename = 'Test.glb';
    const jsonFilename = 'Test.json';

    const angularCallback = (serialized, filename) => {
      const exampleFile = new File([serialized], filename, {
        type: 'text/plain',
      });
      appFacadeApi.exportToCaseFolderLocation(exampleFile);
    };

    GLTF2Export.GLBAsync(objectManager.scene, glbFilename).then((glb) => {
      if (angularCallback) {
        angularCallback(glb.glTFFiles[glbFilename], glbFilename);
      }
    });

    // const result = SceneSerializer.Serialize(objectManager.scene);
    // angularCallback(JSON.stringify(result), jsonFilename);
  }
}
