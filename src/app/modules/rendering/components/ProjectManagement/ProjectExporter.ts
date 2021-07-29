import { Mesh } from '@babylonjs/core';
import { OBJExport, GLTF2Export, STLExport } from '@babylonjs/serializers';
import SceneManager from './../../core/SceneManager';
import ViewApi from './../../ViewApi';

export enum FileTypeEnum {
  STL = 'stl',
  OBJ = 'obj',
  PLY = 'ply',
  GLB = 'glb',
  GLTF = 'gltf',
}

/**
 * ProjectExporter is the class that knows how to exports the project object into different formats
 *
 */
export default class ProjectExporter {
  constructor() {
    //
  }

  export(filename: string, type: FileTypeEnum, meshes: Mesh[]) {
    const angularCallback = (serialized) => {
      const exampleFile = new File([serialized], filename + '.' + type, {
        type: 'text/plain',
      });
      ViewApi.getInstance().API.exportToCaseFolderLocation(exampleFile);
    };

    if (type === FileTypeEnum.OBJ) {
      this.exportToOBJ(filename, meshes, angularCallback);
    } else if (type === FileTypeEnum.STL) {
      this.exportToStl(filename, meshes, angularCallback);
    } else {
      this.exportToGlb(filename, angularCallback);
    }
  }

  exportToStl(filename: string, mesh: Mesh[], angularCallback) {
    const serialized = STLExport.CreateSTL(mesh, false, '', true);
    angularCallback(serialized);
  }

  exportToOBJ(filename: string, mesh: Mesh[], angularCallback?) {
    const serialized = OBJExport.OBJ(mesh);
    angularCallback(serialized);
  }

  exportToGlb(filename, angularCallback?) {
    GLTF2Export.GLBAsync(SceneManager.getInstance().current, filename + '.glb').then((glb) => {
      if (angularCallback) {
        angularCallback(glb.glTFFiles[filename + '.glb']);
      } else {
        glb.downloadFiles();
      }
    });
  }
}
