import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import { Mesh, BoundingBox } from '@babylonjs/core';
import SceneObject from '../SceneObject';
import SceneObjectsManager from '../SceneObjectsManager';

export default class SceneJawObject extends SceneObject {
  constructor(objectManager: SceneObjectsManager, mesh?: Mesh, halfEdgeMesh?: CRHalfEdgeMesh) {
    super(objectManager, mesh, halfEdgeMesh);
  }

  getBoundingBox(): BoundingBox {
    return this.mesh.getBoundingInfo().boundingBox;
  }

  protected _dispose() {}
}
