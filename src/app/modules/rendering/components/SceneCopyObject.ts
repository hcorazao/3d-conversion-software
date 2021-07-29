import { BoundingBox, Mesh, StandardMaterial, Vector3, VertexBuffer } from '@babylonjs/core';
import CutOutMeshRegionAlgorithm from '../core/algorithm/CutOutMeshRegionAlgorithm';
import SceneObject from './SceneObject';
import SceneObjectsManager from './SceneObjectsManager';
import SceneTriangulationLineObject from './SceneTriangulationLineObject';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import SceneManager from '../core/SceneManager';
import { CustomMaterial } from '@babylonjs/materials';

/**
 * A scene object for the copy (the part inside the copy line). The static method
 * creates and returns the scene object.
 *
 * There could be more than 1 copy so the tooth number will be stored as well.
 */
export default class SceneCopyObject extends SceneObject {
  constructor(objectManager: SceneObjectsManager, toothNumber: number, mesh?: Mesh, halfEdgeMesh?: CRHalfEdgeMesh) {
    super(objectManager, mesh, halfEdgeMesh);

    this.toothNumber = toothNumber;
  }

  /**
   * Creates the copy scene object for a given tooth number and returns it.
   * @param toothNumber The tooth number from the copy
   * @param objectManager
   * @param margin
   * @param up
   * @param [visible] Sets the initial visibility between 0 and 1. Default 1.
   * @returns The copy scene object
   */
  static CreateCopy(
    toothNumber: number,
    objectManager: SceneObjectsManager,
    copy: SceneTriangulationLineObject,
    up: Vector3,
    visible = 1
  ): SceneCopyObject {
    const mesh = objectManager.getPickedAsHalfEdgeMesh();
    const colors = objectManager.getPickedAsMesh().getVerticesData(VertexBuffer.ColorKind);
    const center = copy.getCenterOfMass();
    const result = mesh.closestPointOnMeshProjected(center, up, false, true, 10);
    const cutOut = new CutOutMeshRegionAlgorithm('Copy_' + toothNumber, result.index, mesh, copy.polyline, up, visible, colors);
    const copyMesh: Mesh = cutOut.compute();
    const copyMeshHE = new CRHalfEdgeMesh(copyMesh, true);

    copyMeshHE.indexElements();
    copyMeshHE.updateMesh();

    copyMesh.visibility = visible;
    copyMesh.material = new CustomMaterial('', SceneManager.getInstance().current);
    copyMesh.material.wireframe = false;
    copyMesh.material.backFaceCulling = false;

    copyMeshHE.createVertexAttributes();
    for (const v of copyMeshHE.vertices) {
      copyMeshHE.setVertexAttribute(v.index, CRHalfEdgeMesh.VA_COPY + CRHalfEdgeMesh.VA_RESTORATION);
    }

    objectManager.copies[toothNumber] = new SceneCopyObject(objectManager, toothNumber, copyMesh, copyMeshHE);
    objectManager.copies[toothNumber].isPickable = false;
    return objectManager.copies[toothNumber];
  }

  getBoundingBox(): BoundingBox {
    return this.mesh.getBoundingInfo().boundingBox;
  }

  protected _dispose() {
    if (this.toothNumber) {
      this.objectManager.copies[this.toothNumber] = null;
      this.toothNumber = undefined;
    }
  }
}
