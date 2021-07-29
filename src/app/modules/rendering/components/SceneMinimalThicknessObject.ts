import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import { BoundingBox, Color4, Mesh, StandardMaterial, Vector3 } from '@babylonjs/core';
import CopyMeshAlgorithm from '../core/algorithm/CopyMeshAlgorithm';
import InflateMeshAlgorithm from '../core/algorithm/InflateMeshAlgorithm';
import ScalarObtuseAngleFunction from '../core/algorithm/ScalarObtuseAngleFunction';
import SceneManager from '../core/SceneManager';
import SceneObject from './SceneObject';
import CRSceneObjectsManager from './SceneObjectsManager';
import SceneTriangulationLineObject from './SceneTriangulationLineObject';

/**
 * A scene object for the spacer (the part for the glue). The static method
 * creates and returns the scene object.
 *
 * There could be more than 1 spacer so the tooth number will be stored as well.
 */
export default class SceneMinimalThicknessObject extends SceneObject {
  constructor(objectManager: CRSceneObjectsManager, toothNumber: number, mesh?: Mesh, halfEdgeMesh?: CRHalfEdgeMesh) {
    super(objectManager, mesh, halfEdgeMesh);

    this.toothNumber = toothNumber;
  }

  static VISIBILITY = 0.7;

  /**
   * Creates the spacer scene object for a given tooth number and returns it.
   * @param toothNumber The tooth number from the spacer
   * @param objectManager
   * @param margin
   * @param up
   * @param [visible] Sets the initial visibility between 0 and 1. Default 0.
   * @returns The spacer scene object
   */
  static CreateMinimalThickness(
    toothNumber: number,
    objectManager: CRSceneObjectsManager,
    margin: SceneTriangulationLineObject,
    up: Vector3,
    visible = SceneMinimalThicknessObject.VISIBILITY
  ): SceneMinimalThicknessObject {
    const copyMesh = new CopyMeshAlgorithm(
      'MinimalThickness_' + toothNumber,
      objectManager.bottoms[toothNumber].getMesh(),
      new Color4(137 / 256, 207 / 256, 240 / 256, visible)
    );
    const minimalThicknessMesh = copyMesh.compute() as Mesh;
    const minimalThicknessMeshHE = new CRHalfEdgeMesh(minimalThicknessMesh, false);

    const h1 = 0.15 * 0.15; // squared
    const h2 = 1 * 1; // squared

    const inflate = new InflateMeshAlgorithm(
      minimalThicknessMeshHE,
      margin.polyline,
      objectManager.bottoms[toothNumber].getHalfEdgeMesh(),
      new ScalarObtuseAngleFunction(h1, h2, 0.0, 1.0, 60),
      10
    );
    inflate.compute();

    minimalThicknessMeshHE.updateMesh();

    minimalThicknessMesh.visibility = visible;
    minimalThicknessMesh.isPickable = false;
    minimalThicknessMesh.material = new StandardMaterial('', SceneManager.getInstance().current);
    minimalThicknessMesh.material.wireframe = false;
    minimalThicknessMesh.material.backFaceCulling = false;

    objectManager.setMinimalThickness(
      toothNumber,
      new SceneMinimalThicknessObject(objectManager, toothNumber, minimalThicknessMesh, minimalThicknessMeshHE)
    );
    return objectManager.getMinimalThickness(toothNumber);
  }

  getBoundingBox(): BoundingBox {
    return this.mesh.getBoundingInfo().boundingBox;
  }

  protected _dispose() {
    if (this.toothNumber) {
      this.objectManager.minimalThickness[this.toothNumber] = null;
      this.toothNumber = undefined;
    }
  }
}
