import { BoundingBox, Color4, Mesh, Vector3 } from '@babylonjs/core';
import CopyMeshAlgorithm from '../core/algorithm/CopyMeshAlgorithm';
import InflateMeshAlgorithm from '../core/algorithm/InflateMeshAlgorithm';
import ScalarSigmoidFunction from '../core/algorithm/ScalarSigmoidFunction';
import SceneObject from './SceneObject';
import CRSceneObjectsManager from './SceneObjectsManager';
import SceneTriangulationLineObject from './SceneTriangulationLineObject';
import CRHalfEdgeMesh from './../../geometry-processing-js/core/CRHalfEdgeMesh';
import SceneManager from '../core/SceneManager';
import { CustomMaterial } from '@babylonjs/materials';

/**
 * A scene object for the spacer (the part for the glue). The static method
 * creates and returns the scene object.
 *
 * There could be more than 1 spacer so the tooth number will be stored as well.
 */
export default class SceneSpacerObject extends SceneObject {
  constructor(objectManager: CRSceneObjectsManager, toothNumber: number, mesh?: Mesh, halfEdgeMesh?: CRHalfEdgeMesh) {
    super(objectManager, mesh, halfEdgeMesh);

    this.toothNumber = toothNumber;
  }

  /**
   * Creates the spacer scene object for a given tooth number and returns it.
   * @param toothNumber The tooth number from the spacer
   * @param objectManager
   * @param margin
   * @param up
   * @param [visible] Sets the initial visibility between 0 and 1. Default 0.
   * @returns The spacer scene object
   */
  static CreateSpacer(
    toothNumber: number,
    objectManager: CRSceneObjectsManager,
    margin: SceneTriangulationLineObject,
    up: Vector3,
    visible = 1
  ): SceneSpacerObject {
    const copyMesh = new CopyMeshAlgorithm(
      'Spacer_' + toothNumber,
      objectManager.bottoms[toothNumber].getMesh(),
      new Color4(1, 1, 1, 1),
      true
    );
    const spacerMesh: Mesh = copyMesh.compute();
    // const spacerMeshFG = new FriendlyGeometry(spacerMesh);

    const spacerMeshHE = new CRHalfEdgeMesh(spacerMesh, true);

    const inflate = new InflateMeshAlgorithm(
      spacerMeshHE,
      margin.polyline,
      objectManager.bottoms[toothNumber].getHalfEdgeMesh(),
      new ScalarSigmoidFunction(0.15, 1, 0, 0.2),
      10
    );
    inflate.compute();

    spacerMeshHE.updateMesh();

    spacerMesh.visibility = visible;
    spacerMesh.material = new CustomMaterial('', SceneManager.getInstance().current);
    spacerMesh.material.wireframe = false;
    spacerMesh.material.backFaceCulling = false;

    spacerMeshHE.createVertexAttributes();
    for (const v of spacerMeshHE.vertices) {
      spacerMeshHE.setVertexAttribute(v.index, CRHalfEdgeMesh.VA_SPACER);
    }

    objectManager.spacers[toothNumber] = new SceneSpacerObject(objectManager, toothNumber, spacerMesh, spacerMeshHE);
    objectManager.spacers[toothNumber].isPickable = false;
    return objectManager.spacers[toothNumber];
  }

  getBoundingBox(): BoundingBox {
    return this.mesh.getBoundingInfo().boundingBox;
  }

  protected _dispose() {
    if (this.toothNumber) {
      this.objectManager.spacers[this.toothNumber] = null;
      this.toothNumber = undefined;
    }
  }
}
