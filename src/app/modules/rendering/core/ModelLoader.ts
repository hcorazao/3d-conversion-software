import { SceneLoader, Mesh, StandardMaterial } from '@babylonjs/core';
import { OBJFileLoader } from '@babylonjs/loaders';
import SceneManager from './SceneManager';

/**
 * The class loads models from a url and a type. It defines the static messages used when loading 3d models from different sources.
 */

class ModelLoader {
  static loadModel(file, type: string, callback = (mesh) => {}) {
    let url = '';
    try {
      switch (type) {
        case 'obj':
          // url = `${this.baseUrl}/loadFileObj?file=`;
          break;

        case 'obj_vb':
          if (file instanceof File) {
            url = 'file:/';
          }
          OBJFileLoader.IMPORT_VERTEX_COLORS = true;
          break;

        case 'stl':
          // url = 'file:/';
          break;
      }

      SceneLoader.ImportMesh('', url, file, SceneManager.getInstance().current, (newMeshes) => {
        const mesh = newMeshes[0];

        // const oldPivotTranslation = mesh.getBoundingInfo().boundingBox.centerWorld.clone();
        // !NOTE: this translation (next 1st line below this comment) is to center in origin all mesh, but if we use this line
        // ! in occlusion the upper and lower jaw, both assume the same position in origin and is incorrect
        // mesh.position.set(-oldPivotTranslation.x, -oldPivotTranslation.y, -oldPivotTranslation.z);
        // mesh.setPivotMatrix(Matrix.Translation(0, 1, 0), false);
        // (mesh as Mesh).bakeCurrentTransformIntoVertices();
        if (type === 'obj') {
          (mesh as Mesh).material.backFaceCulling = false;
        } else {
          const mat = new StandardMaterial('mat', SceneManager.getInstance().current);
          mat.backFaceCulling = false;
          mesh.material = mat;
        }

        callback(mesh);
        // bounding box
        // const minVec = Vector3.Zero();
        // const maxVec = Vector3.Zero();
        //// calculate the bounding box from all objects in the scene
        // for (const element of this.scene.meshes) {
        //  minVec.x = Math.min(element.getBoundingInfo().boundingBox.minimum.x);
        //  minVec.y = Math.min(element.getBoundingInfo().boundingBox.minimum.y);
        //  minVec.z = Math.min(element.getBoundingInfo().boundingBox.minimum.z);
        //  maxVec.x = Math.max(element.getBoundingInfo().boundingBox.maximum.x);
        //  maxVec.y = Math.max(element.getBoundingInfo().boundingBox.maximum.y);
        //  maxVec.z = Math.max(element.getBoundingInfo().boundingBox.maximum.z);
        // }
        // const newBB = new BoundingInfo(minVec, maxVec);
        // this.camera.setTarget(newBB.boundingBox.center);
      });
    } finally {
    }
  }
}

export default ModelLoader;
