import { BoundingBox, Mesh, Vector3, VertexBuffer } from '@babylonjs/core';
import CutOutMeshRegionAlgorithm from '../core/algorithm/CutOutMeshRegionAlgorithm';
import FillThinSpaceBetweenTriAndLineAlgorithm from '../core/algorithm/FillThinSpaceBetweenTriAndLineAlgorithm';
import SceneObject from './SceneObject';
import SceneObjectsManager from './SceneObjectsManager';
import SceneTriangulationLineObject from './SceneTriangulationLineObject';
import Debug from '../core/debug/Debug';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import { CustomMaterial } from '@babylonjs/materials';
import SceneManager from '../core/SceneManager';
import MeshHelper from '../core/algorithm/MeshHelper';

/**
 * A scene object for the bottom (the part inside the preparation margin). The static method
 * creates and returns the scene object.
 *
 * There could be more than 1 bottom so the tooth number will be stored as well.
 */
export default class SceneBottomObject extends SceneObject {
  constructor(objectManager: SceneObjectsManager, toothNumber: number, mesh?: Mesh, halfEdgeMesh?: CRHalfEdgeMesh) {
    super(objectManager, mesh, halfEdgeMesh);

    this.toothNumber = toothNumber;
  }

  /**
   * Creates the bottom scene object for a given tooth number and returns it.
   * @param toothNumber The tooth number from the bottom
   * @param objectManager
   * @param margin
   * @param up
   * @param [visible] Sets the initial visibility between 0 and 1. Default 0.
   * @returns The bottom scene object
   */
  static CreateBottom(
    toothNumber: number,
    objectManager: SceneObjectsManager,
    margin: SceneTriangulationLineObject,
    up: Vector3,
    visible = 0
  ): SceneBottomObject {
    const mesh = objectManager.getPickedAsHalfEdgeMesh();
    const colors = objectManager.getPickedAsMesh().getVerticesData(VertexBuffer.ColorKind);

    // calc start point
    const center = margin.getCenterOfMass();
    const dir = objectManager.getPickedUpVector();
    // Debug.getInstance().debug_point(center);
    const startFace = mesh.closestPointOnMeshProjected(center, dir, false, true, 4.0).index;
    // Debug.getInstance().debug_point(center);
    // Debug.getInstance().debug_face(mesh.faces[startFace]);

    const cutOut = new CutOutMeshRegionAlgorithm('Bottom_' + toothNumber, startFace, mesh, margin.polyline, up, visible, colors);
    const bottomMesh = cutOut.compute();
    const bottomMeshHE = new CRHalfEdgeMesh(bottomMesh, false);
    objectManager.getDistanceCalculator().vertexIndexMap = cutOut.getVertexIndexMap();
    objectManager.getDistanceCalculator().inflateBottom(new MeshHelper(objectManager.getPickedAsMesh()), margin.polyline);
    objectManager.getInsertionAxisEffect().createGeometry(bottomMesh);

    const sew = new FillThinSpaceBetweenTriAndLineAlgorithm(bottomMeshHE, margin.polyline, up, visible, colors);
    sew.compute();

    bottomMeshHE.indexElements();
    bottomMeshHE.updateMesh();
    bottomMeshHE.createVerticesKdTree();
    bottomMeshHE.createTrianglesKdTree();

    bottomMesh.material = new CustomMaterial('', SceneManager.getInstance().current);
    bottomMesh.material.wireframe = false;
    bottomMesh.material.backFaceCulling = false;

    objectManager.bottoms[toothNumber] = new SceneBottomObject(objectManager, toothNumber, bottomMesh, bottomMeshHE);
    objectManager.bottoms[toothNumber].isPickable = false;
    return objectManager.bottoms[toothNumber];
  }

  getBoundingBox(): BoundingBox {
    return this.mesh.getBoundingInfo().boundingBox;
  }

  protected _dispose() {
    if (this.toothNumber) {
      this.objectManager.bottoms[this.toothNumber] = null;
      this.toothNumber = undefined;
    }
  }
}
